const { formidable } = require("formidable");
const cloudinary = require("cloudinary").v2;
const designModel = require("../models/designModel");
const userImageModel = require("../models/userImageModel");

const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const { promisify } = require("util");
const writeFileAsync = promisify(fs.writeFile);

const designImageModel = require("../models/designImageModel");
const backgroundImageModel = require("../models/backgroundImageModel");
const templateModel = require("../models/templateModel");

async function deleteFileIfExists(path) {
  console.log("path");
  console.log(path);
  path = path.normalize();
  try {
    await fs.access(path, fs.constants.F_OK);

    await fs.unlink(path);

    console.log(`File ${path} deleted successfully.`);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(
        `Il file ${path} non esiste, quindi non è necessario eliminarlo.`
      );
    } else {
      console.error(
        `Si è verificato un errore durante l'eliminazione del file: ${err.message}`
      );
    }
  }
}

const {
  mongo: { ObjectId },
} = require("mongoose");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
});

class designController {
 
  createUserDesign = async (req, res) => {
    const form = formidable({
      uploadDir: "./uploads/design",
      keepExtensions: true,
    });
    const { _id } = req.userInfo;

    try {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(400).json({ message: "Error parsing form data" });
        }

        const image = Array.isArray(files.image) ? files.image[0] : files.image;

        if (!fields.design || !image) {
          return res.status(400).json({ message: "Missing fields or image" });
        }

        let fileName = path.basename(image.filepath);

        const fileExtension = path.extname(image.filepath);

        if (!fileName.endsWith(fileExtension)) {
          fileName += fileExtension;
        }

        const imagePath = image.filepath;
        const uploadedImagePath = `${Date.now()}_${fileName}.png`;

        if (imagePath) {
          const uploadedPath = path.join(__dirname, "../uploads/design/");
          console.log(uploadedPath + image.newFilename);
          console.log(uploadedPath + uploadedImagePath);

          try {
            await fs.rename(
              uploadedPath + image.newFilename,
              uploadedPath + uploadedImagePath
            );
          } catch (error) {
            console.error("Error moving file:", error);
            return res
              .status(500)
              .json({ message: "Error moving uploaded image" });
          }
        }

        const design = await designModel.create({
          user_id: _id,
          components: [JSON.parse(fields.design)],
          image_url: uploadedImagePath,
        });

        return res.status(200).json({ design });
      });
    } catch (error) {
      console.error("Error creating design:", error.message);
      return res.status(500).json({ message: error.message });
    }
  };

  getUserDesign = async (req, res) => {
    const { design_id } = req.params;
    try {
      const design = await designModel.findById(design_id);
      return res.status(200).json({ design: design.components });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  updateUserDesignCloudinary = async (req, res) => {
    const form = formidable({});
    const { design_id } = req.params;
    try {
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
      });
      const [fields, files] = await form.parse(req);
      const { image } = files;
      const components = JSON.parse(fields.design[0]).design;

      const old_design = await designModel.findById(design_id);

      if (old_design) {
        if (old_design.image_url) {
          const splitImage = old_design.image_url.split("/");
          const imageFile = splitImage[splitImage.length - 1];
          const imageName = imageFile.split(".")[0];
          await cloudinary.uploader.destroy(imageName);
        }
        const { url } = await cloudinary.uploader.upload(image[0].filepath);

        await designModel.findByIdAndUpdate(design_id, {
          image_url: url,
          components,
        });

        return res.status(200).json({ message: "Image Save Success" });
      } else {
        return res.status(404).json({ message: "Design Not Found" });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  updateUserDesign = async (req, res) => {
    const form = formidable({
      uploadDir: "./uploads/design",
      keepExtensions: true,
    });
    const { design_id } = req.params;

    try {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(400).json({ message: "Error parsing form data" });
        }

        const components = JSON.parse(fields.design[0]).design;

        const old_design = await designModel.findById(design_id);

        if (old_design) {
          const image = Array.isArray(files.image)
            ? files.image[0]
            : files.image;

          if (!fields.design || !image) {
            return res.status(400).json({ message: "Missing fields or image" });
          }

          const splitImage = old_design.image_url.split("/");
          const imageFile = splitImage[splitImage.length - 1];

          let fileName = path.basename(image.filepath);

          const fileExtension = path.extname(image.filepath);

          if (!fileName.endsWith(fileExtension)) {
            fileName += fileExtension;
          }

          const imagePath = image.filepath;
          const uploadedImagePath = `${Date.now()}_${fileName}.png`;
          const uploadedPath = path.join(__dirname, "../uploads/design/");

          if (imagePath) {
            /*
            console.log(uploadedPath + image.newFilename);
            console.log(uploadedPath + uploadedImagePath);
            console.log(old_design.image_url);
          */
            const oldImagePath = path.join(
              __dirname,
              "../uploads/design/",
              old_design.image_url
            );

            await deleteFileIfExists(oldImagePath)
              .then(() => {
                fs.promises.unlink(oldImagePath);
                fs.unlink(oldImagePath);
              })
              .catch((err) => {
                console.error(`Error deleting file: ${err.message}`);
              });

            /*
            await fs.stat(oldImagePath, (err, stats) => {
              if (err) {
                if (err.code === "ENOENT") {
                  console.log("Old image file not found, skipping deletion.");
                } else {
                  console.error("Error checking old image file:", err);
                }
              } else {
                fs.unlink(oldImagePath, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error("Error deleting old image file:", unlinkErr);
                  } else {
                    console.log("Old image file deleted successfully");
                  }
                });
              }
            });*/

            /*
            fs.promises
              .stat(oldImagePath)
              .then(() => {
                // Il file esiste, procedi con l'eliminazione
                return fs.promises.unlink(oldImagePath);
              })
              .then(() => {
                console.log(
                  `Il file ${oldImagePath} è stato eliminato con successo.`
                );
              })
              .catch((err) => {
                if (err.code === "ENOENT") {
                  console.log(
                    `Il file ${oldImagePath} non esiste, quindi non è necessario eliminarlo.`
                  );
                } else {
                  console.error(
                    `Si è verificato un errore durante l'eliminazione del file: ${err.message}`
                  );
                }
              });
*/
            try {
              await fs.rename(
                uploadedPath + image.newFilename,
                uploadedPath + uploadedImagePath
              );
            } catch (error) {
              console.error("Error moving file:", error);
              return res
                .status(500)
                .json({ message: "Error moving uploaded image" });
            }
          }

          await designModel.findByIdAndUpdate(design_id, {
            image_url: uploadedImagePath,
            components,
          });

          return res.status(200).json({ message: "Image Save Success" });
        } else {
          return res.status(404).json({ message: "Design Not Found" });
        }
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  addUserImageCloudinary = async (req, res) => {
    const { _id } = req.userInfo;
    const form = formidable({});

    cloudinary.config({
      cloud_name: process.env.cloud_name,
      api_key: process.env.api_key,
      api_secret: process.env.api_secret,
    });
    try {
      const [_, files] = await form.parse(req);
      const { image } = files;
      const { url } = await cloudinary.uploader.upload(image[0].filepath);

      const userImage = await userImageModel.create({
        user_id: _id,
        image_url: url,
      });
      return res.status(201).json({ userImage });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  addUserImage = async (req, res) => {
    const { _id } = req.userInfo;
    const form = formidable({
      multiples: true,
      uploadDir: path.join(__dirname, "../uploads"),
      keepExtensions: true,
    });

    try {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Form parse error:", err);
          return res.status(500).json({ message: err.message });
        }

        if (!files.image) {
          return res.status(400).json({ message: "No image uploaded" });
        }

        const image = Array.isArray(files.image) ? files.image[0] : files.image;
        const fileName = path.basename(image.filepath);

        //const oldPath = image.filepath;
        //const newFileName = `${Date.now()}-${image.originalFilename}`;
        // const newPath = path.join(__dirname, "../uploads", newFileName);

        //  fs.rename(oldPath, newPath, async (err) => {

        if (err) {
          console.error("File rename error:", err);
          return res.status(500).json({ message: err.message });
        }

        const userImage = await userImageModel.create({
          user_id: _id,
          image_url: fileName,
        });

        return res.status(201).json({ userImage });
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      return res.status(500).json({ message: error.message });
    }
  };

  getUserImage = async (req, res) => {
    const { _id } = req.userInfo;
    try {
      const images = await userImageModel.find({ user_id: new ObjectId(_id) });
      return res.status(200).json({ images });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getBackgroundImage = async (req, res) => {
    try {
      const images = await backgroundImageModel.find({});
      return res.status(200).json({ images });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  // End Method

  getDesignImage = async (req, res) => {
    try {
      const images = await designImageModel.find({});
      return res.status(200).json({ images });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  // End Method

  getUserDesigns = async (req, res) => {
    const { _id } = req.userInfo;
    try {
      const designs = await designModel
        .find({ user_id: new ObjectId(_id) })
        .sort({ createdAt: -1 });
      return res.status(200).json({ designs });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  // End Method

  deleteUserImage = async (req, res) => {
    const { design_id } = req.params;
    try {
      await designModel.findByIdAndDelete(design_id);
      return res.status(200).json({ message: "Design Delete Succees" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  // End Method

  getTemplates = async (req, res) => {
    try {
      const templates = await templateModel.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ templates });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  // End Method

  addUserTemplate = async (req, res) => {
    const { templateId } = req.params;
    const { _id } = req.userInfo;

    try {
      const template = await templateModel.findById(templateId);
      const design = await designModel.create({
        user_id: _id,
        components: template.components,
        image_url: template.image_url,
      });
      return res.status(200).json({ design });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getUploadedImage = async (req, res) => {
    const uploadDir = process.env.UPLOADS_DIRECTORY || "./uploads";
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        return res.status(404).json({ message: "File not found" });
      }

      res.sendFile(filePath);
    } catch (error) {
      console.error("Error read file:", error);
      return res.status(500).json({ message: "Error read file" });
    }
  };

  getDesignImage = async (req, res) => {
    const uploadDir =
      process.env.UPLOADS_DIRECTORY + "/design" || "./uploads/design";
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        return res.status(404).json({ message: "File not found" });
      }

      res.sendFile(filePath);
    } catch (error) {
      console.error("Error read file:", error);
      return res.status(500).json({ message: "Error read file" });
    }
  };
}

module.exports = new designController();

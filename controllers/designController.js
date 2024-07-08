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
  createUserDesignCloudinary = async (req, res) => {
    const form = formidable({});
    const { _id } = req.userInfo;
    try {
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
      });
      const [fields, files] = await form.parse(req);
      const { image } = files;
      const { url } = await cloudinary.uploader.upload(image[0].filepath);

      const design = await designModel.create({
        user_id: _id,
        components: [JSON.parse(fields.design[0])],
        image_url: url,
      });
      return res.status(200).json({ design });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  createUserDesign = async (req, res) => {
    const form = formidable({
      uploadDir: "./uploads",
      keepExtensions: true,
    });
    const { _id } = req.userInfo;

    try {
      // Parsa il form per ottenere i campi e i file
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(400).json({ message: "Error parsing form data" });
        }

        const { image } = files;

        // Verifica che i campi necessari siano presenti
        if (!fields.design || !image) {
          return res.status(400).json({ message: "Missing fields or image" });
        }

        const imagePath = image.path; // Percorso del file temporaneo
        const uploadedImagePath = `./uploads/${Date.now()}_${image.name}`;

        if (imagePath) {
          if (fs.existsSync(imagePath)) {
            try {
              await fs.rename(imagePath, uploadedImagePath);
            } catch (error) {
              console.error("Error moving file:", error);
              return res
                .status(500)
                .json({ message: "Error moving uploaded image" });
            }
          }
        }

        const design = await designModel.create({
          user_id: _id,
          components: [JSON.parse(fields.design)],
          image_url: uploadedImagePath,
        });

        // Rispondi con il design creato
        return res.status(200).json({ design });
      });
    } catch (error) {
      // Gestisci gli errori
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

  updateUserDesign = async (req, res) => {
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
  // End Method

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
}

module.exports = new designController();

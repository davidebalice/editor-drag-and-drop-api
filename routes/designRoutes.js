const designController = require("../controllers/designController");
const router = require("express").Router();
const auth = require("../middlewares/auth");
const authImg = require("../middlewares/authImg");
const demoMode = require("../middlewares/demo_mode");

router.post(
  "/create-user-design",
  demoMode,
  auth,
  designController.createUserDesign
);
router.get("/user-design/:design_id", auth, designController.getUserDesign);
router.put(
  "/update-user-design/:design_id",
  demoMode,
  auth,
  designController.updateUserDesign
);

router.post("/add-user-image", demoMode, auth, designController.addUserImage);
router.get("/get-user-image", auth, designController.getUserImage);
router.get("/png-images", auth, designController.getPngImage);
router.get("/background-images", auth, designController.getBackgroundImage);
router.get("/design-images", auth, designController.getDesignImage);

router.get("/user-designs", auth, designController.getUserDesigns);
router.put(
  "/delete-user-image/:design_id",
  demoMode,
  auth,
  designController.deleteUserImage
);

router.get("/templates", auth, designController.getTemplates);
router.get(
  "/add-user-template/:template_id",
  auth,
  designController.addUserTemplate
);

router.get("/uploaded-images/:filename", demoMode, authImg, (req, res) =>
  designController.getImages(req, res, "uploadedImages")
);

router.get("/images/:filename", authImg, (req, res) =>
  designController.getImages(req, res, "images")
);

router.get("/backgrounds/:filename", authImg, (req, res) =>
  designController.getImages(req, res, "background")
);

router.get("/png/:filename", authImg, (req, res) =>
  designController.getImages(req, res, "png")
);

router.get("/design-images/:filename", authImg, (req, res) =>
  designController.getImages(req, res, "design")
);

module.exports = router;

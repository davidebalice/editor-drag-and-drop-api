const designController = require("../controllers/designController");
const router = require("express").Router();
const auth = require("../middlewares/auth");
const authImg = require("../middlewares/authImg");

router.post("/create-user-design", auth, designController.createUserDesign);
router.get("/user-design/:design_id", auth, designController.getUserDesign);
router.put(
  "/update-user-design/:design_id",
  auth,
  designController.updateUserDesign
);

router.post("/add-user-image", auth, designController.addUserImage);
router.get("/get-user-image", auth, designController.getUserImage);

router.get("/background-images", auth, designController.getBackgroundImage);
router.get("/design-images", auth, designController.getDesignImage);

router.get("/user-designs", auth, designController.getUserDesigns);
router.put(
  "/delete-user-image/:design_id",
  auth,
  designController.deleteUserImage
);

router.get("/templates", auth, designController.getTemplates);
router.get(
  "/add-user-template/:template_id",
  auth,
  designController.addUserTemplate
);

router.get(
  "/uploaded-images/:filename",
  authImg,
  designController.getUploadedImage
);

module.exports = router;

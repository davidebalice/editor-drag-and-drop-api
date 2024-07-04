const authController = require("../controllers/authController");
const router = require("express").Router();
const getUser = require("../middlewares/getUser");

router.post("/user-register", authController.userRegister);
router.post("/user-login", authController.userLogin);
router.post("/get/user", getUser);
module.exports = router;

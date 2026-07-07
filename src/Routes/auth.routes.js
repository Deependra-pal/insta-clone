const express = require("express");

const authController = require("../controller/auth.controller");

const { registerValidation, validate, loginValidation } = require("../middlewares/user.validation");

const router = express.Router();

router.post("/register", registerValidation, validate, authController.registerController);
router.post("/login" , loginValidation , validate , authController.loginController);
 





module.exports = router;

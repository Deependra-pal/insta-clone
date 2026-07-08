const express = require("express");

const authController = require("../controller/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware")

const { registerValidation, validate, loginValidation } = require("../validations/user.validation");
 

const router = express.Router();



router.post("/register", registerValidation, validate, authController.registerController);
router.post("/login" , loginValidation , validate , authController.loginController);
router.get("/get-me" , authMiddleware , authController.getMeController);
router.post("/logout" , authMiddleware , authController.logoutController)
 





module.exports = router;

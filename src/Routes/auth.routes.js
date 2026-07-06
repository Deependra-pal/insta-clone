const express = require("express");

const authController = require("../controller/auth.controller");

const { registerValidation, validate } = require("../middlewares/user.validation");

const router = express.Router();

router.post("/register", registerValidation, validate, authController.registerController);





module.exports = router;

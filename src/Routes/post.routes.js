const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {createPostValidation,validate,} = require("../validations/post.validation");
const multer  = require('multer')

const upload = multer({storage:multer.memoryStorage()})

const postController = require("../controller/post.controller");

const router = express.Router();

router.post("/",upload.single("image"),createPostValidation,validate,authMiddleware,postController.createPostController);

module.exports = router;


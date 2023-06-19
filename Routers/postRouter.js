const express = require("express")
const router = express.Router()

const { postController } = require("./../Controllers")
const {multerUpload} = require("./../Middleware/multer")


router.post("/", multerUpload.single('postImage'), postController.create)
router.put("/modify/:id", postController.modify)
router.delete("/delete/:id", postController.delete)
router.get("/", postController.getAllPost)
router.get("/users/:id", postController.getUserPost)
router.get("/:id", postController.getDetailPost)

module.exports = router
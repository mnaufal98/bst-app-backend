const express = require("express")
const router = express.Router()
const { authController } = require("./../Controllers")
const auth = require("./../Middleware/auth")

const {multerUpload} = require("./../Middleware/multer")


router.post("/register", authController.userRegister)
router.post("/login", authController.authLogin)
router.post("/user", authController.userLogin)
router.patch("/modify", multerUpload.single("profileImage"), authController.editUser)
router.put("/activation", auth.verifyToken, authController.activation )

module.exports = router
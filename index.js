const express = require("express")
const cors = require("cors")

const app = express()
app.use(express.json())

const PORT = 5005

app.use(cors())

const { authRouter } = require("./Routers")
const { postRouter } = require("./Routers")

//pemanggilan image
app.use(express.static('Public'))

app.use("/auth", authRouter)
app.use("/post", postRouter)

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})

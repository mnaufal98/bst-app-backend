const jwt = require('jsonwebtoken')

module.exports = {
    verifyToken: (req, res, next) => {
        let token = req.query

        if(!token) {
            return res.status(401).send({
                success: false,
                message: "unauthorize 333",
                data: null
            })
        }
        try {
            // token = token.split(" ")[1]

            if(token === null || !token){
                return res.status(401).send({
                    success: false,
                    message: "unauthorize",
                    data: null
                })
            }

            let verifyUser = jwt.verify(token, "coding-is-easy")
            console.log('verify user', verifyUser)
            if(!verifyUser) {
                return res.status(401).send({
                    success: false,
                    message: "unauthorize 1",
                    data: null
                })
            }

            req.user = verifyUser
            next()

        } catch (error) {
            return res.status(500).send({
                    success: false,
                    message: error.message,
                    data: null
                })
        }
    },

}
const db = require("./../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { op } = require("sequelize");
const handlebars = require("handlebars");
const fs = require("fs");
const transporter = require("./../Helper/Transporter");

const User = db.User;

module.exports = {
  userRegister: async (req, res) => {
    try {
      const { email, userName, password, confirmPassword } = req.body;

      if (!email || !userName || !password || !confirmPassword) {
        return res.status(400).send({
          success: false,
          message: "Data is Not Fully Filled!",
          data: null,
        });
      }

      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

      if (pattern.test(password) == false) {
        return res.status(404).send({
          success: false,
          message:
            "Password must be 8 characters, 1 uppercase, 1 lowercase and 1 number!",
          data: null,
        });
      }

      if (password != confirmPassword) {
        return res.status(404).send({
          success: false,
          message: "password doesn't match",
          data: null,
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      const result = await User.create({
        email: email,
        userName: userName,
        password: hashPassword,
      });

      
      if (result) {
          let payload = {
              id: result.id,
              email: result.email,
              userName: result.userName
            }
            
          const token = jwt.sign(payload, "coding-its-easy")
          
            const data = await fs.readFileSync(
              "./Public/templateEmail/activationEmail.html",
              "utf-8"
            );
            const tempCompile = await handlebars.compile(data);
            const tempResult = tempCompile({
              email: email,
              link: `http://localhost:3000/activation?token=${token}`,
            });
            await transporter.sendMail({
                    from: 'Admin',
                    to: "mnaufal98@gmail.com",
                    subject: 'Activation acuscount',
                    html: tempResult
                })
                
        return res.status(200).send({
          success: true,
          message: "Resgister success!",
          data: result,
        });
      } else {
        return res.status(406).send({
          success: false,
          message: "Register failed!",
          data: null,
        });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  },
  authLogin: async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        console.log(usernameOrEmail, password)
        
        if (!usernameOrEmail || !password) {
            return res.status(400).send({
              success: false,
              message: "Data is Not Fully Filled!",
              data: null,
            });
          }

        let result;
        
        if (usernameOrEmail.includes('@')) {
            result = await User.findOne({
                where: {
                    email: usernameOrEmail,
                }
            })
        } else {
            result = await User.findOne({
                where: {
                    userName: usernameOrEmail,
                }
            })
        }

        if (!result) {
            return res.status(404).send({
                success: false,
                message: 'Wrong email/username or password!',
                data: null,
            });
        }

        const isUser = await bcrypt.compare(password, result.password)
        if (isUser) {
            return res.status(200).send({
                success: true,
                message: 'Login Success',
                data: {
                    id: result.id,
                    email: result.email,
                    userName: result.userName,
                  isStatus: result.isStatus,
                    
                },
            });
        } else {
            return res.status(404).send({
                success: false,
                message: 'Wrong email/username or password!',
                data: null,
            });
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
            data: null,
        });
    }
  },
  userLogin: async (req, res) => {
    try {
      const { id } = req.body
      const result = await User.findOne({
        where: {
          id: id
        }
      })
      return res.status(200).send({
        success: true,
        message: 'success',
        data: result,
    });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
        data: null,
    });
    }
  },
  editUser: async (req, res) => {
    try {
      const { userName, fullName, bio, id } = req.body
      let file = req.file
      console.log(file, "ini fileeeeeejfbeajkbfkjeab")

      const checkUserName = await User.findOne({
        where: {
          userName: userName
        }
      })
      const checkUser = await User.findOne({
        where: {
          id: id
        }
      })
      if (checkUser.isStatus == false)
      return res.status(400).send({
        success: false,
        message: "You are inactive account!",
        data: null
      })

      if (checkUserName && checkUserName.userName != checkUser.userName)
        return res.status(400).send({
          success: false,
          message: "Username already used!",
          data: null
        })

      if (!checkUser) {
        return res.status(400).send({
          success: false,
          message: "Product not found!",
          data: null,
        });
      } else {
        console.log("masukkk")
        const result = await User.update({
          userName: userName ? userName : checkUser.userName,
          fullName: fullName ? fullName : checkUser.fullName,
          bio: bio ? bio : checkUser.bio,
          profileImage: file?.filename ? file?.filename : checkUser.profileImage
        }, {
          where: {
            id: id
          }
        })

        const resultUpdate = await User.findOne({
          where: {
            id: id
          }
        })
        return res.status(201).send({
          success: true,
          message: "Edit success!",
          data: resultUpdate,
        })

      }
      

    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
        data: null,
    });
    }
  },
  activation: async (req, res) => {
    try {
      const { token } = req.body
      const id = req.user.id
      
      const result = await User.update({
        isStatus: true
      }, {
        where: {
          id: id
        }
      })

      if (result) {
        return res.status(201).send({
          success: true,
          message: "Activation success!",
          data: resultUpdate,
        })
      } else {
        return res.status(400).send({
          success: false,
          message: "failed!",
          data: null,
        })
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
        data: null,
    });
    }
  }
};

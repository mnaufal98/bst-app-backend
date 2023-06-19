const db = require("./../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { op } = require("sequelize");
const sequelize = require("sequelize")
const handlebars = require("handlebars");
const fs = require("fs");
const transporter = require("./../Helper/Transporter");

const User = db.User;
const Post = db.Post;
const UserLike = db.UserLike

module.exports = {
  create: async (req, res) => {
    try {
      const { userId, caption } = req.body;
      const file = req.file;

      if (!file)
        return res.status(400).send({
          success: false,
          message: "Image is required!",
          data: null,
        });
      const checkUser = await User.findOne({
        where: {
          id: userId,
        },
      });
      if (checkUser.isStatus == false)
        return res.status(400).send({
          success: false,
          message: "You are inactive account!",
          data: null,
        });

      const result = await Post.create({
        userId: userId,
        caption: caption ? caption : "",
        postImage: file?.filename ? file?.filename : "",
      });

      if (result) {
        return res.status(200).send({
          success: true,
          message: "post success!",
          data: result,
        });
      } else {
        return res.status(400).send({
          success: false,
          message: "post failed!",
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
  modify: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, caption } = req.body;

      const findData = await Post.findOne({
        where: {
          id: id,
        },
      });
      if (!findData)
        return res.status(400).send({
          success: false,
          message: "post not found",
          data: null,
        });

      if (findData.userId !== userId)
        return res.status(404).send({
          success: false,
          message: "Not user post",
          data: null,
        });

      if (findData.userId === userId) {
        const result = await Post.update(
          {
            caption: caption ? caption : findData.caption,
          },
          {
            where: {
              id: id,
            },
          }
        );

        const resultUpdate = await Post.findOne({
          where: {
            id: id,
          },
        });

        return res.status(201).send({
          success: true,
          message: "update success",
          data: resultUpdate,
        });
      } else {
        return res.status(406).send({
          success: false,
          message: "update failed",
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
  delete: async (req, res) => {
    try {
      const { userId } = req.query;
      const { id } = req.params;
      console.log(id, userId);

      const findData = await Post.findOne({
        where: {
          id: id,
        },
      });
      console.log(findData);
      if (!findData)
        return res.status(400).send({
          success: false,
          message: "post not found",
          data: null,
        });
      if (findData.userId == userId) {
        let deleteProduct = await Post.destroy({
          where: {
            id: id,
            userId: userId,
          },
        });

        return res.status(200).send({
          success: true,
          message: "Product deleted!",
          data: null,
        });
      } else {
        return res.status(404).send({
          success: false,
          message: "Not user post",
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
  getAllPost: async (req, res) => {
    try {
      let result = await Post.findAll({
        include: [{ model: User }],
        order: [["id", "DESC"]],
      });
      return res.status(200).send({
        success: true,
        message: "Fetch success",
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
  getUserPost: async (req, res) => {
    try {
      const { id } = req.params;

      let result = await Post.findAll({
        include: [{ model: User }],
        where: { userId: id },
      });
      if (result) {
        return res.status(200).send({
          success: true,
          message: "Fetch success",
          data: result,
        });
      } else {
        return res.status(400).send({
          success: true,
          message: "Fetch failed",
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
  getDetailPost: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await Post.findOne({
        where: {
          id: id,
        },
        include: [{ model: User }],
      });
      if (result) {
        return res.status(200).send({
          success: true,
          message: "Fetch success",
          data: result,
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
  postLike: async (req, res) => {
    try {
      const { postId, userId } = req.body;

      const result = await UserLike.findOne({
        where: {
          postId: postId,
          userId: userId,
        },
      });

      if (!result) {
        const like = await UserLike.create({
          userId: userId,
          postId: postId,
        });

        if (like) {
          return res.status(201).send({
            success: true,
            message: "like success",
            data: like,
          });
        } else {
          return res.status(400).send({
            success: false,
            message: "like failed",
            data: null,
          });
        }
      } else {
        const unLike = await UserLike.destroy({
          where: {
            userId: userId,
            postId: postId,
          },
        });

        if (unLike) {
          return res.status(200).send({
            success: true,
            message: "unlike success",
            data: unLike,
          });
        } else {
          return res.status(404).send({
            success: false,
            message: "unlike failed",
            data: null,
          });
        }
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  },
  countLike: async (req, res) => {
    try {
      const result = await UserLike.findAll({
        attributes: [
          'postId',
          [sequelize.fn('COUNT', sequelize.col('postId')), 'total'],
      ],
        group: 'postId'
      })

      res.status(200).send({
        success: true,
        message: "success",
        data: result,
      })
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }
};

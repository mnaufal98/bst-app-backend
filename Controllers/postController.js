const db = require("./../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { op } = require("sequelize");
const handlebars = require("handlebars");
const fs = require("fs");
const transporter = require("./../Helper/Transporter");

const User = db.User;
const Post = db.Post;

module.exports = {
  create: async (req, res) => {
    try {
      const { userId, caption } = req.body;
      const file = req.file;

      const result = await Post.create({
        userId: Number(userId),
        caption: caption ? caption : "",
        postImage: file.filename ? file.filename : "",
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
      const { id } = req.params;
      const { userId } = req.body;

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
      if (findData.userId !== userId) {
        return res.status(404).send({
          success: false,
          message: "Not user post",
          data: null,
        });
      } else {
        let deleteProduct = await Post.destroy({
          where: {
            id: id,
          },
        });

        return res.status(200).send({
          success: true,
          message: "Product deleted!",
          data: null,
        });
      }
    } catch (error) {
      res.status(500).send({
        success: true,
        message: error.message,
        data: null,
      });
    }
  },
  getAllPost: async (req, res) => {
    try {
      let result = await Post.findAll({
        include: [{ model: User }],
      });
      return res.status(200).send({
        success: true,
        message: "Fetch success",
        data: result,
      });
    } catch (error) {
      res.status(500).send({
        success: true,
        message: error.message,
        data: null,
      });
    }
  },
  getUserPost: async (req, res) => {
    try {
      const { id } = req.params;

      let result = await Post.findAll({
        include: [
          { model: User }
          ],
          where:{userId: id}
      });
      return res.status(200).send({
        success: true,
        message: "Fetch success",
        data: result,
      });
    } catch (error) {
      res.status(500).send({
        success: true,
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
    } catch (error) {}
  },
};

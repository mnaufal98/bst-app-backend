"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Post, {
        foreignKey: "userId",
      }),
        User.hasMany(models.UserLike, {
          foreignKey: "userId",
        });
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        unique: {
          name: "email",
          msg: "Email already used!",
        },
        validate: {
          isEmail: {
            msg: "Email must be valid!",
          },
        },
      },
      userName: {
        type: DataTypes.STRING,
        unique: {
          name: "userName",
          msg: "User name already used!",
        },
      },
      password: DataTypes.STRING,
      isStatus: DataTypes.BOOLEAN,
      bio: DataTypes.STRING,
      fullName: DataTypes.STRING,
      profileImage: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};

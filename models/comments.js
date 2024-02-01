const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./users");
const BlogPost = require("./blogPost");
class Comments extends Model {}

Comments.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    blogPostId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: BlogPost,
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
    },
  },
  { sequelize, modelName: "comment", freezeTableName: false }
);

module.exports = Comments;

const { Model, DataTypes } = require("sequelize");
const User = require("./users");
const sequelize = require("../config/db");

class BlogPost extends Model {}

BlogPost.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
  },
  { sequelize, modelName: "blog_post", freezeTableName: false }
);

console.log(BlogPost)

module.exports = BlogPost;

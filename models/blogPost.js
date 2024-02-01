const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class BlogPost extends Model {}

BlogPost.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey:true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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

module.exports = BlogPost;

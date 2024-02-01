const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Comments extends Model {}

Comments.init(
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
    blogPostId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
  },
  { sequelize, modelName: "comment", freezeTableName: false }
);

module.exports = Comments;

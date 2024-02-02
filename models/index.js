const Users = require("./users");
const BlogPosts = require("./blogPost");
const Comments = require("./comments");

Users.hasMany(BlogPosts);
BlogPosts.belongsTo(Users);

Users.hasMany(Comments);
Comments.belongsTo(Users);

BlogPosts.hasMany(Comments);
Comments.belongsTo(BlogPosts);

module.exports = { Users, BlogPosts, Comments };

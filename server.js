const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const PORT = process.env.PORT || 5000;
const db = require("./config/db");
const path = require("path");
const { Users, BlogPosts, Comments } = require("./models");
//=================================================================================================================================================

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Template Engine
app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/", async (req, res) => {
  const blogposts = await BlogPosts.findAll({
    raw: true,
    include: [Users],
  });
  // console.log(blogposts);

  return res.render("index", { blogposts });
});

app.get("/blogs/:id", async (req, res) => {
  const { id } = req.params;

  let blogPost = await BlogPosts.findAll({
    where: { id: id },
    raw: true,
    include: [Comments, Users],
  });

  blogPost = blogPost[0];
  const username = blogPost["user.username"];
  const comment = blogPost["comments.content"];
  const commentUserId = blogPost["comments.userId"];

  const [user] = await Users.findAll({
    where: { id: commentUserId },
    raw: true,
  });

  const comments = await Comments.findAll({ where: { userId: commentUserId },raw:true , include:[Users]});
  // console.log(blogPost)
  console.log(comments);
  // console.log(comment)
  return res.render("singleBlog", { blogPost, username,comments, user });
});
//=================================================================================================================================================

db.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`listening to app on port ${PORT}`);
  });
});

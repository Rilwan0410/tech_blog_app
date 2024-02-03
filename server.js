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

  const comments = await Comments.findAll({
    where: { userId: commentUserId },
    raw: true,
    include: [Users],
  });
  // console.log(blogPost)
  // console.log(comments);
  // console.log(comment)
  return res.render("singleBlog", { blogPost, username, comments, user });
});

app.get("/blogs/:id/comment", async (req, res) => {
  const { id } = req.params;

  let [blogPost] = await BlogPosts.findAll({
    where: { id: id },
    raw: true,
    include: [Comments, Users],
  });

  const blogPostUser = blogPost.userId;

  const [user] = await Users.findAll({
    where: { id: blogPostUser },
    raw: true,
  });
  console.log(blogPostUser);

  res.render("addComment", { blogPost, user });
});

app.get("/:id/dashboard", async (req, res) => {
  const { id } = req.params;

  let [user] = await Users.findAll({
    where: { id: id },
    raw: true,
  });

  let blogPosts = await BlogPosts.findAll({ where: { userId: id }, raw: true });

  // console.log(blogPosts);

  console.log(user);
  return res.render("dashboardPage", { layout: "dashboard", blogPosts, user });
});

app.get("/:id/dashboard/newpost", (req, res) => {
  return res.render("newPost", { layout: "dashboard" });
});

app.get("/dashboard/edit/:id", async (req, res) => {
  const { id } = req.params;

  const [blogPost] = await BlogPosts.findAll({ where: { id }, raw: true });
  // console.log(blogPost);

  return res.render("editPage", { blogPost });
});

app.post("/dashboard/edit/:id", async (req, res) => {
  const { id } = req.params;
  const [blogPost] = await BlogPosts.findAll({ where: { id: id } });
  // console.log(blogPost);
  const [user] = await Users.findAll({
    where: { id: blogPost.userId },
    raw: true,
  });
  console.log(user);

  await BlogPosts.update(req.body, { where: { id: id } });
  return res.redirect(`/${user.id}/dashboard`);
});
//=================================================================================================================================================

db.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`listening to app on port ${PORT}`);
  });
});

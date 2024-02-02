const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const PORT = process.env.PORT || 5000;
const db = require("./config/db");
const path = require("path");
// const Users = require("./models/users");
// const BlogsPosts = require("./models/blogPost");
// const Comments = require("./models/comments");

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
  console.log(blogposts);
  // let titles = blogposts.map((posts) => (posts.createdAt));

  // let time = titles.split('T')
  // console.log(time)
// console.log(titles)
  // console.log(new Date(titles))
  return res.render("index", { blogposts });
});
//=================================================================================================================================================

db.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`listening to app on port ${PORT}`);
  });
});

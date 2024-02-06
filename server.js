const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const { engine } = handlebars;
const PORT = process.env.PORT || 5000;
const db = require("./config/db");
const path = require("path");
const bcrypt = require("bcrypt");
const { Users, BlogPosts, Comments } = require("./models");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
//=================================================================================================================================================

const hbs = handlebars.create({});
hbs.handlebars.registerHelper("getDate", (date) => {
  return date.toLocaleDateString();
});

// Session
app.set("trust proxy", 1);
app.use(
  session({
    secret: "Secret Sauce",
    cookie: {
      expires: 60000,
      secure:
        process.env.NODE_ENV && process.env.NODE_ENV == "production"
          ? true
          : false,
    },
    resave: false,
    saveUninitialized: true,
    proxy: true,
    store: new SequelizeStore({
      db,
    }),
  })
);

// Middleware 
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Template Engine
app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", "./views");

// ROUTES //
app.get("/", async (req, res) => {
  let sessionLive = req.session.loggedIn;
  console.log(sessionLive);
  console.log(req.session);
  const blogposts = await BlogPosts.findAll({
    raw: true,
    include: [Users],
    order: [["createdAt", "DESC"]],
  });
  // console.log(blogposts);

  return res.render("index", { blogposts, sessionLive });
});

// dashboard routes
app.get("/dashboard", async (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect("/login");
  }

  console.log(req.session);

  const { user_id: id } = req.session;

  let [user] = await Users.findAll({
    where: { id: id },
    raw: true,
  });

  let blogPosts = await BlogPosts.findAll({ where: { userId: id }, raw: true });

  return res.render("dashboardPage", {
    layout: "dashboard",
    blogPosts,
    user,
  });
});
app.get("/dashboard/newpost", (req, res) => {
  return res.render("newPost", { layout: "dashboard" });
});
app.post("/dashboard/newpost", async (req, res) => {
  const { title, content } = req.body;
  const { user_id: id } = req.session;

  try {
    await BlogPosts.create({ content, title, userId: id });
    return res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    res.status(404).json(err)
  }
});
app.get("/dashboard/edit/:id", async (req, res) => {
  const { id: blogPost_id } = req.params;

  const [blogPost] = await BlogPosts.findAll({
    where: { id: blogPost_id },
    raw: true,
  });
  return res.render("editPage", { blogPost, layout: "dashboard" });
});
app.post("/dashboard/edit/:id", async (req, res) => {
  const { id: blogPost_id } = req.params;
  await BlogPosts.update(req.body, { where: { id: blogPost_id } });
  return res.redirect(`/dashboard`);
});
app.get("/dashboard/edit/:id/delete", (req, res) => {
  BlogPosts.destroy({ where: { id: req.params.id } });
  res.redirect("/dashboard");
});

// blog routes
app.get("/blogs/:id", async (req, res) => {
  console.log(req.session);
  const { id } = req.params;
  const { user_id } = req.session;
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
    where: { blogPostId: id },
    raw: true,
    include: [Users],
    order: [["createdAt", "DESC"]],
  });
  // console.log(blogPost)
  // console.log(comments);
  // console.log(comment)
  return res.render("singleBlog", { blogPost, username, comments, user });
});
app.get("/blogs/:id/comment", async (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect("/login");
  }
  // console.log(req.session);
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
  // console.log(blogPostUser);

  res.render("addComment", { blogPost, user });
});
app.post("/blogs/:id/comment", async (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect("/login");
  }

  const { user_id } = req.session;
  // console.log(req.session);
  const { id } = req.params;
  const { content } = req.body;

  console.log(id, content);

  let [blogPost] = await BlogPosts.findAll({
    where: { id: id },
    raw: true,
    include: [Comments, Users],
  });

  const blogPostUser = blogPost.userId;

  const [user] = await Users.findAll({
    where: { id: user_id },
    raw: true,
  });
  // console.log(blogPostUser);

  let comment = await Comments.create({
    content,
    userId: user.id,
    blogPostId: id,
  });
  console.log(comment);
  res.redirect(`/blogs/${id}`);
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const errMessages = [];
  const { username, password } = req.body;
  let validPassword;

  try {
  let userData = await Users.findOne({
    where: { username: username },
    raw: true,
  });

  if (userData) {
    validPassword = await bcrypt.compare(password, userData.password);
  }

  if (!userData || !validPassword || username == "") {
    if (!userData) {
      errMessages.push("Invalid username ");
    }

    if (userData && !validPassword) {
      errMessages.push("Invalid Password");
    }

    if (username == "") {
      errMessages.push("Fill in username field");
    }

    if (password == "") {
      errMessages.push("Fill in password field");
    }

    console.log(errMessages);
    return res.render("login", { errMessages });
  }

  req.session.save(() => {
    req.session.user_id = userData.id;
    req.session.username = userData.username;
    req.session.loggedIn = true;
  });

  res.render("dashboardPage");
  } catch (err) {
  res.status(404).json(err)
  }
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  let { username, password } = req.body;
  const errMsgs = [];

  if (!(password && username)) {
    if (password.length < 1) {
      errMsgs.push("Must create a password");
    }

    if (username.length < 1) {
      errMsgs.push("Must create a username");
    }

    console.log(errMsgs);
    return res.render("signup", { errMsgs });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  password = hashedPassword;

  await Users.create({
    username,
    password,
  });
  return res.redirect("/login");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

//=================================================================================================================================================

db.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`listening to app on port ${PORT}`);
  });
});

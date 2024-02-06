const express = require("express");
const bcrypt = require("bcrypt");
const { Users, BlogPosts, Comments } = require("../models");


const router = express.Router()

router.get("/", async (req, res) => {
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

router.get("/login", (req, res) => {
    res.render("login");
  });
  
  router.post("/login", async (req, res) => {
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
        res.redirect("/dashboard");
      });
    } catch (err) {
      res.status(404).json(err);
    }
  });
  
  router.get("/signup", (req, res) => {
    res.render("signup");
  });
  
  router.post("/signup", async (req, res) => {
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
  
  router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
  });
  

  module.exports = router
const express = require("express");
const { Users, BlogPosts, Comments } = require("../models");
const router = express.Router();



router.get("/", async (req, res) => {
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
  router.get("/newpost", (req, res) => {
    return res.render("newPost", { layout: "dashboard" });
  });
  router.post("/newpost", async (req, res) => {
    const { title, content } = req.body;
    const { user_id: id } = req.session;
  
    try {
      await BlogPosts.create({ content, title, userId: id });
      return res.redirect("/dashboard");
    } catch (err) {
      console.log(err);
      res.status(404).json(err);
    }
  });
  router.get("/edit/:id", async (req, res) => {
    const { id: blogPost_id } = req.params;
  
    const [blogPost] = await BlogPosts.findAll({
      where: { id: blogPost_id },
      raw: true,
    });
    return res.render("editPage", { blogPost, layout: "dashboard" });
  });
  router.post("/edit/:id", async (req, res) => {
    const { id: blogPost_id } = req.params;
    await BlogPosts.update(req.body, { where: { id: blogPost_id } });
    return res.redirect(`/dashboard`);
  });
  router.get("/edit/:id/delete", (req, res) => {
    BlogPosts.destroy({ where: { id: req.params.id } });
    res.redirect("/dashboard");
  });

  module.exports = router
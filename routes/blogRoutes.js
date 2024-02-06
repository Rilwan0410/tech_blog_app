const express = require("express");
const { Users, BlogPosts, Comments } = require("../models");

const router = express.Router();

router.get("/:id", async (req, res) => {
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
  return res.render("singleBlog", {
    layout: "main",
    blogPost,
    username,
    comments,
    user,
  });
});
router.get("/:id/comment", async (req, res) => {
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
router.post("/:id/comment", async (req, res) => {
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

module.exports = router;

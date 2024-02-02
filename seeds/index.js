const { BlogPosts, Comments, Users } = require("../models");

const db = require("../config/db");
const userSeeds = require("./userSeeds.js");
const blogPostSeeds = require("./blogPostSeeds");
const commentSeeds = require("./commentSeeds");

console.log(Comments);
console.log("alskdf");

async function seedData() {
  await db.sync({ force: true });
  await Users.bulkCreate(userSeeds);
  console.log(`
  -----SYNCED USERS-----
  `);
  await BlogPosts.bulkCreate(blogPostSeeds);
  console.log(
    `
  -----SYNCED BLOG POSTS-----
  `
  );
  await Comments.bulkCreate(commentSeeds);
  console.log(`
  -----SYNCED COMMENTS-----
  `);
}

seedData();

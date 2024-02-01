const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const PORT = process.env.PORT || 5000;
const db = require("./config/db");
const path = require("path");
j
//=================================================================================================================================================

console.log(db);
// Middleware
app.use(express.static("public"));

// Template Engine
app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("index", {});
});
//=================================================================================================================================================

db.sync({ force: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`listening to app on port ${PORT}`);
  });
});

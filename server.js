const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const PORT = process.env.PORT || 5000;
const db = require("./config/db");
//=================================================================================================================================================

// Template Engine
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.send("Hello World");
});
//=================================================================================================================================================


app.listen(PORT, () => {
  console.log(`listening to app on port ${PORT}`);
});
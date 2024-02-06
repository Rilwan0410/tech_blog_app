const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const { engine } = handlebars;
const PORT = process.env.PORT || 5000;
const db = require("./config/db");
const { Users, BlogPosts, Comments } = require("./models");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const hbs = handlebars.create({});
dashboardRoutes = require("./routes/dashboardRoutes");
blogRoutes = require("./routes/blogRoutes");
homeRoutes = require("./routes/homeRoutes");
hbs.handlebars.registerHelper("getDate", (date) => {
  return date.toLocaleDateString();
});
//=================================================================================================================================================

// Session //
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

// Middleware //
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Template Engine //
app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", "./views");

// ROUTES //
app.use("/", homeRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/blogs", blogRoutes);

//=================================================================================================================================================

db.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`listening to app on port ${PORT}`);
  });
});

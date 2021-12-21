const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const session = require("express-session");
const path = require("path");
const passport = require("passport");
require("./paasport-setup");

const postsRouter = require("./routes/posts");
const indexRouter = require("./routes/index");
const categoryRouter = require("./routes/categories");

const app = express();
mongoose
  .connect("mongodb://127.0.0.1:27017/nodeblog")
  .then(() => console.log("DB connection successful!!"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({ secret: "secret", resave: true, saveUninitialized: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(session({ secret: "secret", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.locals.moment = require("moment");
app.locals.truncatedText = function (text, length) {
  return text.substring(0, length);
};

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    next();
  } else {
    res.locals.user = null;
    next();
  }
});

app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

app.get("/login", (req, res) => {
  res.send("failed to Login. Please try again");
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.use("/", indexRouter);
app.use("/posts", postsRouter);
app.use("/categories", categoryRouter);

app.listen(3000, () => console.log("Server is running on port 3000"));

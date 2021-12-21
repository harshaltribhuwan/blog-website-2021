const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const Post = require("./../models/postsModel");
const Category = require("./../models/categoriesModel");

// To know the user is authenticated or not
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/");
  }
}

// To render add category page
router.get("/add", isAuthenticated, (req, res) => {
  res.render("addcategory", { title: "Add Category" });
});

// To show category wise bolgs only
router.get("/show/:category", (req, res) => {
  Post.find({ category: req.params.category }, {}, (err, posts) => {
    if (err) throw err;
    res.render("index", { title: req.params.category, posts: posts });
  });
});

// To add category
router.post("/add", body("name").notEmpty(), (req, res) => {
  const name = req.body.name;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("addcategory", { errors: errors.array() });
    return;
  }
  Category.create({ name }, (err, category) => {
    if (err) throw err;
    res.redirect("/");
  });
});
module.exports = router;

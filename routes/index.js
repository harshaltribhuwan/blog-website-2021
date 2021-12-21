const express = require("express");
const router = express.Router();
const Post = require("./../models/postsModel");

// To get home page
router.get("/", (req, res) => {
  Post.find({}, {}, function (err, posts) {
    if (err) throw err;
    else {
      res.render("index", { title: "blog", posts: posts });
    }
  });
});

module.exports = router;

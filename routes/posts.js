const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "./public/images" });
const { body, validationResult } = require("express-validator");
const Post = require("./../models/postsModel");
const Category = require("./../models/categoriesModel");
const User = require("./../models/usersModel");

// To know the user is authenticated or not
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/");
  }
}

// router.get("/:id", async (req, res) => {
//   try {
//     if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
//       const post = await Post.findOne({ _id: req.params.id });
//       res.json(post);
//     }
//   } catch (err) {
//     console.error(err);
//   }
// });

// To show single view
router.get("/show/:id", (req, res) => {
  Post.findOne({ _id: req.params.id }, (err, post) => {
    if (err) throw err;
    res.render("show", { title: "blog", post: post, user: req.user });
  });
});

// To get add categories view
router.get("/add", isAuthenticated, (req, res) => {
  Category.find({}, (err, categories) => {
    if (err) throw err;
    res.render("addpost", { title: "Add Post", categories: categories });
  });
});

// To add categories
router.post(
  "/add",
  isAuthenticated,
  upload.single("mainimage"),
  body("title").notEmpty(),
  body("category").notEmpty(),
  body("body").notEmpty(),
  body("author").notEmpty(),
  async (req, res) => {
    const { title, category, body, author } = req.body;
    const date = new Date();
    let mainimage;
    if (req.file) {
      mainimage = req.file.filename;
    } else {
      mainimage = "noimage.png";
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      Category.find({}, {}, (err, categories) => {
        if (err) throw err;
        res.render("addpost", {
          categories: categories,
          errors: errors.array(),
        });
        return;
      });
    } else {
      try {
        await Post.create({ title, category, body, mainimage, author, date });
      } catch (err) {
        throw err;
      }
      req.flash("success", "Post succesfully added");
      res.location("/");
      res.redirect("/");
    }
  }
);

// To add comments
router.post(
  "/addcomments",
  isAuthenticated,
  body("name").notEmpty(),
  body("email").isEmail(),
  body("email").notEmpty(),
  body("body").notEmpty(),
  async (req, res) => {
    const { name, email, body } = req.body;
    const postid = req.body.postid;
    const commentDate = new Date();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      Post.findOne({ _id: postid }, (err, post) => {
        if (err) throw err;
        res.render("show", {
          post: post,
          errors: errors.array(),
        });
        return;
      });
    } else {
      const comment = {
        name,
        email,
        body,
        commentDate,
      };
      Post.updateOne(
        { _id: postid },
        { $push: { comments: comment } },
        (err, post) => {
          if (err) throw err;
          req.flash("success", "Comment Added");
          res.location(`/posts/show/${postid}`);
          res.redirect(`/posts/show/${postid}`);
        }
      );
    }
  }
);

// To add the like
router.post("/show/:id/like", async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      $push: { likes: req.user._id },
    });

    res.redirect(`/posts/show/${req.params.id}`);
  } catch (err) {
    console.error(err);
  }
});

// To unlike a post
router.post("/show/:id/unlike", async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      $pull: { likes: req.user._id },
    });
    res.redirect(`/posts/show/${req.params.id}`);
  } catch (err) {
    console.error(err);
  }
});

// router.post("/test", (req, res) => {
//   console.log(req.body.postid);
//   res.end();
// });

module.exports = router;

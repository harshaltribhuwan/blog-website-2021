const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  category: String,
  body: String,
  date: Date,
  author: String,
  mainimage: String,
  likes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  comments: [{ name: String, email: String, body: String, commentDate: Date }],
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;

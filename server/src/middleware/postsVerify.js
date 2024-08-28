//models
const Post = require("../models/posts.model.js");

async function postsVerfy(req, res, next) {
  try {
    const { id: postId } = req.params;
    if (!postId) return res.status(400).json(["Post unabailable"]);
    const post = await Post.findById(postId);
    //valida post encontrado por postId
    if (!post) return res.status(400).json(["Post not Found"]);
    //valida usuaior que elimina post
    if (post.author.toString() !== req.userId)
      return res.status(400).json(["Acction fail"]);
    req.post = post;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json([error.message]);
  }
}

module.exports = postsVerfy;

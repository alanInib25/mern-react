const { Router } = require("express");
const postsRouter = Router();
//middlewares
const authRequire = require("../middleware/authRequire.js");
const postsVerify = require("../middleware/postsVerify.js");
//validators
const { tokenValidate, idValidate } = require("../validators/generals.validate.js");
const postValidate = require("../validators/posts.validator.js");
//controllers
const {
  addPost,
  getPosts,
  getPost,
  deletePost,
  updatePost,
} = require("../controller/posts.controllers.js");

postsRouter.post("/", tokenValidate, authRequire, postValidate, addPost);
postsRouter.get("/", tokenValidate, authRequire, getPosts);
postsRouter.get("/:id", tokenValidate, authRequire, idValidate, getPost);
postsRouter.delete("/:id", tokenValidate, authRequire, idValidate, postsVerify, deletePost);
postsRouter.patch("/:id", tokenValidate, authRequire, idValidate, postsVerify, postValidate, updatePost);

module.exports = postsRouter;

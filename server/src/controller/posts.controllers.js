//model
const Post = require("../models/posts.model.js");
const User = require("../models/users.model.js");
const Thumbnail = require("../models/thumbnail.model.js");
//UUID
const { v4: uuidv4 } = require("uuid");
//path
const { join } = require("path");
//fs
const { unlink } = require("node:fs/promises");
//thumbnail size
const { THUMBNAIL_SIZE } = require("../utils/handleConfig.js");

//Agrega posts
const addPost = async (req, res) => {
  try {
    const { description } = req.body;
    //valida archivo
    if (!req.files) return res.status(400).json(["Select an image"]);
    const { thumbnail } = req.files;
    //valida tamaño del archivo
    if (thumbnail.size > THUMBNAIL_SIZE)
      return res
        .status(400)
        .json([
          `Upload file less than ${THUMBNAIL_SIZE[0]}mb. (${THUMBNAIL_SIZE} bytes)`,
        ]);

    //nombre de thumbnail
    const extFile = thumbnail.name.split(".")[1];
    //validacion de extencion;
    if (extFile !== "jpg" && extFile !== "png" && extFile !== "jpeg")
      return res
        .status(400)
        .json(["Format thumbnail must be .jpg, .png, .jpeg"]);
    //generacion de nombre pra almacenar en server
    const nameFile = `${uuidv4()}.${extFile}`;
    //ubicacion de thumbnail
    await thumbnail.mv(join(__dirname, "..", "uploads/posts", nameFile));

    //guarda thumbnail en bd
    const newThumbnail = await new Thumbnail({
      thumbnail: nameFile,
      name: thumbnail.name,
      creator: req.userId,
    }).save();

    //guarda post en bd
    const { _id: newPostId } = await new Post({
      description,
      thumbnail: nameFile,
      author: req.userId,
      thumbnail: newThumbnail._id,
    }).save();

    //incrementa número de posts en usuario en bd
    const user = await User.findById(req.userId);
    user.posts = user.posts + 1;
    await user.save();

    //respuesta
    const newPost = await Post.findById(newPostId)
      .populate("thumbnail")
      .populate({ path: "author", select: "-password" });
    return res.status(200).json(newPost);
  } catch (error) {
    return res.status(500).json([error.message]);
  }
};

//Obtiene todos los post y sus creadores
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({
        path: "author",
        select: "-password",
      })
      .populate({ path: "thumbnail" })
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json([error.message]);
  }
};

//obtiene post por id
const getPost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    //valida postId
    if (!postId) return res.status(400).json(["Post unabailable"]);
    const post = await Post.findById(postId)
      .populate({
        path: "author",
        select: "-password",
      })
      .populate({
        path: "thumbnail",
      });
    if (!post) return res.status(400).json(["Post not found"]);
    return res.status(200).json(post);
  } catch (error) {
    return req.status(500).json([error.message]);
  }
};

//elimina Post por id
const deletePost = async (req, res) => {
  try {
    const { post } = req;
    //elimina thumbnail del servidor
    await unlink(
      join(__dirname, "..", "uploads/posts", post.thumbnail.thumbnail)
    );
    //elimina thumbail de db
    await Thumbnail.findByIdAndDelete(post.thumbnail._id);
    //elimina post de db
    await Post.findByIdAndDelete(post._id);
    //descuenta numero de post de usuario
    const user = await User.findById(req.userId);
    user.posts = user.posts - 1;
    await user.save();
    //respuesta
    return res.status(200).json([`Post deleted successfull`]);
  } catch (error) {
    return res.status(500).json([error.message]);
  }
};

//update Post por id
const updatePost = async (req, res) => {
  let postsUpdated;
  try {
    const { post } = req;
    const { description } = req.body;

    //Actualizacion de posts sin thumbnail nuevo
    if (!req.files) {
      post.description = description;
      await post.save();
    } else {
      //si trae nueva imagen
      const { thumbnail } = req.files;
      //valida size de thumbnail
      if (thumbnail.size > THUMBNAIL_SIZE)
        return res.status(400).json([
          `Upload file less 
          than ${THUMBNAIL_SIZE[0]}mb. (${THUMBNAIL_SIZE} bytes)`,
        ]);

      //Elimina desde server el thumbnail anterior
      await unlink(
        join(__dirname, "..", "/uploads/posts", post.thumbnail.thumbnail)
      );

      //generar nuevo nombre para el nuevo thumbnail
      const extfile = thumbnail.name.split(".")[1];
      const nameFile = uuidv4() + "." + extfile;

      //ubicacion de nuevo thumbnail
      await thumbnail.mv(join(__dirname, "..", "uploads/posts", nameFile));

      //guarda thumbnail en bd
      await Thumbnail.findByIdAndUpdate(post.thumbnail, {
        thumbnail: nameFile,
        name: thumbnail.name,
      });
      //actualiza propiedad description de documento post
      post.description = description;
      await post.save();
    }

    //respuesta
    postsUpdated = await Post.findById(post._id)
      .populate({ path: "author", select: "-password" })
      .populate("thumbnail");
    return res.status(200).json(postsUpdated);
  } catch (error) {
    return res.status(500).json([error.message]);
  }
};

module.exports = {
  addPost,
  getPosts,
  getPost,
  deletePost,
  updatePost,
};

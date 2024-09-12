//model
const User = require("../models/users.model.js");
const { hashPass, comparePass } = require("../utils/handlePass.js");
//uuid
const { v4: uuid } = require("uuid");
//file
const fsPromises = require("fs").promises;
//path
const path = require("path");
//thumbnail size
const { THUMBNAIL_SIZE } = require("../utils/handleConfig.js");

//get user profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId, "-password");
    if (!user) return res.status(400).json(["User Error"]);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json([error.message]);
  }
};

//get user
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, "-password").exec();
    if (!user) return res.status(400).json(["Not user"]);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json([error.message]);
  }
};

//get users
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .exec();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json([error.message]);
  }
};

//update user
const updateUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    //valida email duplicado
    const user = await User.findOne({ email });
    if (user && user._id.toString() !== req.userId)
      return res.status(400).json(["Email exist"]);
    //valida passwords iguales
    if (password !== confirmPassword)
      return res.status(400).json(["Passwords not equals"]);
    //hash password
    const hash = await hashPass(password);

    //update user
    const userUpdated = await User.findByIdAndUpdate(
      req.userId,
      { name, email, password: hash },
      { new: true }
    );
    //-select password
    userUpdated.set("password", undefined);
    return res.status(200).json(userUpdated);
  } catch (error) {
    return res.status(500).json([error.message]);
  }
};

//update avatar
const updateAvatar = async (req, res) => {
  try {
    //valida avatar
    if (!req.files) return res.status(400).json(["Not Image"]);
    //obtiene avatar
    const { avatar } = req.files;

    //valida tamaño del avatar
    if (avatar.size > THUMBNAIL_SIZE)
      return res
        .status(400)
        .json([
          `Upload file less than ${THUMBNAIL_SIZE[0]}mb. (${THUMBNAIL_SIZE} bytes)`,
        ]);

    //valida extencion de avatar
    const extFile = avatar.name.split(".")[1];
    if (extFile !== "jpg" && extFile !== "png" && extFile !== "jpeg")
      return res
        .status(400)
        .json(["Format thumbnail must be .jpg, .png, .jpeg"]);

    //busca el usuario
    const user = await User.findById(req.userId, "-password").exec();
    //valida existencia de avatar anterior, si existe lo elimina
    if (user.avatar)
      await fsPromises.unlink(
        path.join(__dirname, "..", "/uploads/avatar", user.avatar)
      );

    //Genera nombre de avatar
    const avatarName = uuid() + "." + extFile;
    //ubica nuevo avatar
    await avatar.mv(path.join(__dirname, "..", "/uploads/avatar", avatarName));
    //setea nombre de avatar en documento
    user.avatar = avatarName;
    //guarda la nueva informacion
    const userUpdated = await user.save();
    return res.status(200).json(userUpdated.avatar);
  } catch (error) {
    return res.status(500).json([error.message]);
  }
};

module.exports = {
  getUserProfile,
  getUser,
  getUsers,
  updateUser,
  updateAvatar,
};

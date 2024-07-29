//model
const User = require("../models/users.model.js");
const { hashPass } = require("../utils/handlePass.js");
//uuid
const { v4: uuid } = require("uuid");
//file
const fsPromises = require("fs").promises;
//path
const path = require("path");

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
    const users = await User.find().select("-password").sort({ createdAt: -1 }).exec();
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
    const emailIs = await User.findOne({ email });
    if (emailIs && emailIs._id.toString() !== req.userId) return res.status(400).json(["Email exist"]);
    //valida passwords iguales
    if (password !== confirmPassword)
      return res.status(400).json(["Passwords not equals"]);
    //hash password
    const hash = await hashPass(password);
    //update user
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email, password: hash },
      { new: true, select: "-password" }
    );
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json([error.message]);
  }
};

//update avatar
const updateAvatar = async (req, res) => {
  try {
    //valida avatar
    if (!req.files) return res.status(400).json(["Not Image"]);
    //usuario
    const user = await User.findById(req.userId, "-password").exec();
    //valida avatar anterior
    if (user.avatar)
      await fsPromises.unlink(
        path.join(__dirname, "..", "/uploads", user.avatar)
      );
    //avatar
    const { avatar } = req.files;
    const extFile = avatar.name.split(".")[1];
    const avatarName = uuid() + "." + extFile;
    //ubica nuevo avatar
    await avatar.mv(path.join(__dirname, "..", "/uploads", avatarName));
    user.avatar = avatarName;
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

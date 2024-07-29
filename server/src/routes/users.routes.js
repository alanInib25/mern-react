const { Router } = require("express");
const usersRouter = Router();
//controllers
const {
  getUserProfile,
  getUser,
  getUsers,
  updateUser,
  updateAvatar,
} = require("../controller/users.controllers.js");
//middlewares
const authRequire = require("../middleware/authRequire.js");
//validators
const { tokenValidate, idValidate } = require("../validators/generals.validate.js");
const { updateUserValidate } = require("../validators/users.validator.js");

//endpoint
usersRouter.get("/profile", tokenValidate, authRequire, getUserProfile);
usersRouter.get("/:id", tokenValidate, authRequire, idValidate, getUser);
usersRouter.get("/", tokenValidate,  authRequire, getUsers);
usersRouter.patch("/update", tokenValidate, authRequire, updateUserValidate, updateUser);
usersRouter.post("/avatar", tokenValidate, authRequire, updateAvatar);

module.exports = usersRouter;

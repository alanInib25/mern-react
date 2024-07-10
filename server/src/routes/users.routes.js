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

//endpoint
usersRouter.get("/profile", authRequire, getUserProfile);
usersRouter.get("/:id", authRequire, getUser);
usersRouter.get("/", authRequire, getUsers);
usersRouter.patch("/update", authRequire, updateUser);
usersRouter.post("/avatar", authRequire, updateAvatar);

module.exports = usersRouter;

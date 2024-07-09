const { Router } = require("express");
const authRouter = Router();
//middlewares
const authRequire = require("../middleware/authRequire.js");
//controllers
const {
  authSignup,
  authSignin,
  authSignout,
  authResetPassword,
  authForgotPassword,
} = require("../controller/auth.controllers.js");

//post
authRouter.post("/signup", authSignup);
authRouter.post("/signin", authSignin);
authRouter.get("/signout", authRequire, authSignout);
authRouter.post("/forgot-password", authForgotPassword);
authRouter.post("/reset-password/:forgotToken", authResetPassword);

module.exports = authRouter;

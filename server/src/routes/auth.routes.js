const { Router } = require("express");
const authRouter = Router();
//middlewares
const authRequire = require("../middleware/authRequire.js");
//controllers
const {
  authSignup,
  authSignin,
  authSignout,
  authSigninCheck,
  authResetPassword,
  authForgotPassword,
} = require("../controller/auth.controllers.js");
//validators
const {
  signupValidate,
  signinValidate,
  forgotValidate,
  resetValidate,
} = require("../validators/auth.validator.js");
const { tokenValidate } = require("../validators/generals.validate.js");

//post
authRouter.post("/signup", signupValidate, authSignup);
authRouter.post("/signin", signinValidate, authSignin);
authRouter.post("/forgot-password", forgotValidate, authForgotPassword);
authRouter.post("/reset-password/:forgotToken", resetValidate, authResetPassword);
//get
authRouter.get("/signout", tokenValidate, authRequire, authSignout);
authRouter.get("/signin-check", tokenValidate, authRequire, authSigninCheck);


module.exports = authRouter;

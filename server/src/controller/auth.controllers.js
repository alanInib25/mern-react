//models
const User = require("../models/users.model.js");
//handle token
const { signToken, verifyToken } = require("../utils/handleToken.js");
//handle pass
const { hashPass, comparePass } = require("../utils/handlePass.js");
//nodemailer
const nodemailer = require("nodemailer");
//config
const {
  NODEMAILER_EMAIL,
  NODEMAILER_EMAIL_PASS,
} = require("../utils/handleConfig.js");

//register user
const authSignup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const emailIs = await User.findOne({ email });
    //email duplicado
    if (emailIs) return res.status(400).json(["Email exists"]);
    //hash password
    const hash = await hashPass(password);
    //instancia User
    await new User({ name, email, password: hash }).save();
    return res.status(200).json(["Signup successful"]);
  } catch (error) {
    return res.status(500).json([error.message]);
  }
};

//login user
const authSignin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    //check pass
    const checkPass =
      user === null ? false : await comparePass(password, user.password);
    if (!checkPass) return res.status(400).json(["Invalid credentials"]);
    //accessToken
    const accessToken = await signToken({ id: user._id }, "10m");
    //set cookie with accesstoken
    res.cookie("accessToken", accessToken, { maxAge: 1000 * 60 * 10 });
    //-select password
    user.set("password", undefined);
    return res.status(200).json(user);
  } catch (error) {
    return res.send(500).json([error.message]);
  }
};

//logout user
const authSignout = async (req, res) => {
  res.cookie("accessToken", "", { expiresIn: new Date(0) });
  return res.sendStatus(200);
};

//forgot password user
const authForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json(["Invalid credentials"]);
    //token para url de recuperacion
    const forgotToken = await signToken({ id: user._id }, "5m");
    //nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${NODEMAILER_EMAIL}`,
        pass: `${NODEMAILER_EMAIL_PASS}`,
      },
    });

    var mailOptions = {
      from: `${NODEMAILER_EMAIL}`,
      to: `${user.email}`,
      subject: "Food - Reset Password",
      text: `http://localhost:5173/auth/resetPassword/${forgotToken}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) return res.status(401).json(["Email don´t send"]);
      return res.status(200).json(["email send"]);
    });
  } catch (error) {
    return res.status(500).json([error.message]);
  }
};

//reset password user
const authResetPassword = async (req, res) => {
  try {
    const { forgotToken } = req.params;
    const { password } = req.body;
    const hash = await hashPass(password);
    const userId = await verifyToken(forgotToken);
    await User.findOneAndUpdate({ _id: userId.id }, { password: hash});
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json([error.message]);
  }
};

module.exports = {
  authSignup,
  authSignin,
  authSignout,
  authForgotPassword,
  authResetPassword,
};

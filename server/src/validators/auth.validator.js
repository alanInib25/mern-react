const { check } = require("express-validator");
const validateResult = require("../utils/handleValidators");

const signupValidate = [
  check("name", "Invalid Name").notEmpty().isString(),
  check("email", "Invalid Email").notEmpty().isEmail(),
  check("password", "Invalid Password between 6 and 12 charact")
    .notEmpty()
    .isString()
    .isLength({ min: 6, max: 12 }),
  validateResult,
];

const signinValidate = [
  check("email", "Invalid Email").notEmpty().isEmail(),
  check("password", "Invalid Password between 6 and 12 charact")
    .notEmpty()
    .isString()
    .isLength({ min: 6, max: 12 }),
  validateResult,
];

const forgotValidate = [
  check("email", "Invalid Email").notEmpty().isEmail(),
  validateResult,
];

const resetValidate = [
  check("password", "Invalid Password between 6 and 12 charact")
    .notEmpty()
    .isString()
    .isLength({ min: 6, max: 12 }),
  check("confirmPassword", "Invalid Confirm Password between 6 and 12 charact")
    .notEmpty()
    .isString()
    .isLength({ min: 6, max: 12 }),
  validateResult,
];
module.exports = { signupValidate, signinValidate, forgotValidate, resetValidate };

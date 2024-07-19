const { check } = require("express-validator");
const validateResult = require("../utils/handleValidators.js");

const updateUserValidate = [
  check("name", "Invalid Name").notEmpty().isString(),
  check("email", "Invalid Email").notEmpty().isEmail().normalizeEmail(),
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


module.exports = { updateUserValidate };

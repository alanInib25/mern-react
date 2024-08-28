//express-validator
const { check } = require("express-validator");
//controlador de validacion
const validateResult = require("../utils/handleValidators.js");

const addPostValidate = [
  check("description", "Invalid description, 200 character max.")
    .notEmpty()
    .isString()
    .isLength({ max: 200 }),
  validateResult,
];

module.exports = addPostValidate;

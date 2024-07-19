const { check } = require("express-validator");
const validateResult = require("../utils/handleValidators");

const tokenValidate = [check("accessToken", "Invalid Token").notEmpty().isJWT(), validateResult];

const idValidate = [check("id", "Invalid Id").notEmpty().isMongoId(), validateResult];

module.exports = { tokenValidate, idValidate }

const { validationResult } = require("express-validator");

const validateResult = (req, res, next) => {
  try {
    validationResult(req).throw();
    return next();
  } catch (error) {
    const errorText = error.errors.reduce((a, i) => a += i.msg + ", ", "");
    return res.status(400).json([errorText])
  }
};

module.exports = validateResult;
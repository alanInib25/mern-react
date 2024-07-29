const { validationResult } = require("express-validator");

const validateResult = (req, res, next) => {
  try {
    validationResult(req).throw();
    return next();
  } catch (error) {
    const errorText = [...new Set(error.errors.map(({msg}) => msg))].join(", ");
    return res.status(400).json([errorText])
  }
};

module.exports = validateResult;
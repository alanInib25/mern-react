const { sign, verify } = require("jsonwebtoken");
//config
const { JWT_PASS } = require("../utils/handleConfig.js");

//sign token
const signToken = (payload, expires) =>{
  return new Promise((resolve, reject) => {
    sign(payload, JWT_PASS, { expiresIn: `${expires}` }, (err, token) => {
      if (err) return reject(err);
      return resolve(token);
    });
  })
};

//verify token
const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    verify(token, JWT_PASS, (err, decode) => {
      if (err) return reject(err);
      return resolve(decode);
    });
  });

module.exports = { signToken, verifyToken };

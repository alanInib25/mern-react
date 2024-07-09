const { hash, compare } = require("bcryptjs");

//hash password
const hashPass = (password) =>
  new Promise((resolve, reject) =>
    hash(password, 10, (err, hash) => {
      if (err) return reject(err);
      return resolve(hash);
    })
  );

//compare passwords
const comparePass = (password, passwordHash) =>
  new Promise((resolve, reject) =>
    compare(password, passwordHash, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    })
  );

module.exports = { hashPass, comparePass };

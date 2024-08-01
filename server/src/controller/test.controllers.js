const User = require("../models/users.model.js");
const testRouter = require("express").Router();

testRouter.post("/reset", async (req, res) => {
  await User.deleteMany({});
  return res.status(204).end();
})

module.exports = testRouter
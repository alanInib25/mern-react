const { verifyToken } = require("../utils/handleToken.js");

const authRequire = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    const user = !accessToken ? false : await verifyToken(accessToken);
    if (!user) return res.status(400).json(["Error credentials"]);
    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(500).json([error]);
  }
};

module.exports = authRequire;

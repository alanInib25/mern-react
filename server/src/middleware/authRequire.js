const { verifyToken } = require("../utils/handleToken.js");

const authRequire = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    const user = !accessToken ? false : await verifyToken(accessToken);
    //status(401) (en client se interpreta como una redireccion a signin)
    if (!user) return res.status(401).json(["Token expires"]);
    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(404).json([error.message]);
  }
};

module.exports = authRequire;

const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  return res.status(404).json([error.message]);
}

module.exports = notFound;
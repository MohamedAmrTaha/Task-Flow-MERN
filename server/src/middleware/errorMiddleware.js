export const notFound = (req, res) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  // map known error types to the right status
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value" });
  }
  if (err.name === "CastError") {
    return res.status(404).json({ message: "Not found" });
  }
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Not authorized" });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON body" });
  }
  // Other client-side errors raised by Express/body-parser (e.g. 413 too large)
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: "Bad request" });
  }

  console.error(err);
  res.status(500).json({ message: "Server error" });
};

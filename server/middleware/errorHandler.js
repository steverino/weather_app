export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  console.error(`[${req.id}]`, err);

  res.status(500).json({
    error: "Internal server error",
    requestId: req.id,
  });
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.code === "P2002") {
    return res.status(409).json({
      error: "A category with this unique value already exists"
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      error: "Category not found"
    });
  }

  res.status(error.statusCode || 500).json({
    error: error.statusCode ? error.message : "Internal server error"
  });
}
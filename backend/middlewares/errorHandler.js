// BUG FIX: Added Mongoose ValidationError handling (was returning 500 instead of 400)
// BUG FIX: Added custom statusCode support from service-layer errors
// BUG FIX: Added Mongoose duplicate key (11000) error handling
const errorHandler = (err, req, res, next) => {
  // Use custom statusCode from service errors, or fall back to response status, or 500
  let statusCode =
    err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Internal Server Error";

  // Mongoose CastError — invalid ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Mongoose ValidationError — schema validation failed
  if (err.name === "ValidationError") {
    statusCode = 400;
    const fields = Object.values(err.errors).map((e) => e.message);
    message = fields.join(", ");
  }

  // MongoDB Duplicate Key Error (e.g., unique email/username)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired, please login again";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export { errorHandler };

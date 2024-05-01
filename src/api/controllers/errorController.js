const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Server Error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });


  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  }
};

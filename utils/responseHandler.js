const ok = (res, message, data = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

const created = (res, message, data = {}) => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};

const error = (res, statusCode, message, errorDetails = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails,
  });
};

module.exports = { ok, created, error };

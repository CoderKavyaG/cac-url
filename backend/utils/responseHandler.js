/**
 * Send a success response
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a created response
 */
const createdResponse = (res, data, message = 'Created successfully') => {
  successResponse(res, data, message, 201);
};

/**
 * Send a paginated response
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

module.exports = { successResponse, createdResponse, paginatedResponse };

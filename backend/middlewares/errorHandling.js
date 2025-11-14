const errorHandling = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = { ...err };
  error.message = err.message;

  // PostgreSQL unique violation (duplicate key)
  if (err.code === '23505') {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 409 };
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    const message = 'Referenced resource not found';
    error = { message, statusCode: 404 };
  }

  // PostgreSQL not null violation
  if (err.code === '23502') {
    const message = 'Required field is missing';
    error = { message, statusCode: 400 };
  }

  // PostgreSQL check constraint violation
  if (err.code === '23514') {
    const message = 'Invalid data provided';
    error = { message, statusCode: 400 };
  }

  // Default to 500 if no specific status code
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  res.status(statusCode).json({
    status: statusCode,
    message: message,
    data: null
  });
};

export default errorHandling;
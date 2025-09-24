const errorHandling = (err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      error: err.message || 'An unexpected error occurred'
    })
  }
  
  export default errorHandling;
  
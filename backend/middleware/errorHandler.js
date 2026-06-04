const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]', err.message || err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    return res.status(400).json({ 
      msg: `An account with this ${key} already exists.` 
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ 
      msg: messages.join('. ') 
    });
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      msg: `Resource not found with id of ${err.value}` 
    });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    msg: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ msg: 'Name is required' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ msg: 'Please include a valid email address' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ msg: 'Please include a valid email address' });
  }
  if (!password) {
    return res.status(400).json({ msg: 'Password is required' });
  }
  next();
};

const validateTask = (req, res, next) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ msg: 'Task title is required' });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTask
};

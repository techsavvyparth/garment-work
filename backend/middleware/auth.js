const jwt = require('jsonwebtoken');
const { collection } = require('../utils/jsonDB');

const JWT_SECRET = process.env.JWT_SECRET || 'ladies-work-demo-secret-2024';

const protect = (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const Users = collection('users');
    const user = Users.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { protect };

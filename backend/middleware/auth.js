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
    let user = Users.findById(decoded.id);
    
    // Fallback for demo admin ID if not found in database (e.g. read-only filesystem / clean db)
    if (!user && decoded.id === 'demo-admin-id-12345') {
      user = {
        _id: 'demo-admin-id-12345',
        name: 'Admin User',
        email: 'admin@gmail.com',
        companyName: 'Shree Enterprises',
        role: 'admin'
      };
    }

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { protect };

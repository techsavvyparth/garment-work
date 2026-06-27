const express = require('express');
const jwt = require('jsonwebtoken');
const { collection } = require('../utils/jsonDB');
const { protect } = require('../middleware/auth');
const router = express.Router();

const Users = collection('users');
const JWT_SECRET = process.env.JWT_SECRET || 'ladies-work-demo-secret-2024';
const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password required' });
    
    const exists = Users.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = Users.create({ name, email: email.toLowerCase(), password, companyName: companyName || 'My Company', role: 'admin' });
    
    const { password: _, ...safeUser } = user;
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const normalizedEmail = email.toLowerCase();
    let user = Users.findOne({ email: normalizedEmail });

    // Fallback for demo admin if not found in database (e.g. read-only filesystem / clean db)
    if (!user && (normalizedEmail === 'admin@gmail.com' || normalizedEmail === 'admin@example.com') && password === 'admin123') {
      try {
        user = Users.create({
          name: 'Admin User',
          email: normalizedEmail,
          password: 'admin123',
          companyName: 'Shree Enterprises',
          role: 'admin'
        });
      } catch (err) {
        console.warn('⚠️ Warning: Could not create demo user in DB, using in-memory mock:', err.message);
        user = {
          _id: 'demo-admin-id-12345',
          name: 'Admin User',
          email: normalizedEmail,
          companyName: 'Shree Enterprises',
          role: 'admin'
        };
      }
    }

    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // Skip password check for our in-memory mock user since we already verified the password above
    if (user._id !== 'demo-admin-id-12345') {
      if (user.password !== password) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const { password: _, ...safeUser } = user;
    const token = signToken(user._id);
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get current user
router.get('/me', protect, (req, res) => {
  const { password: _, ...safeUser } = req.user;
  res.json({ success: true, user: safeUser });
});

// Update profile
router.put('/profile', protect, (req, res) => {
  try {
    const { name, companyName, phone, address, companyLogo } = req.body;
    const updated = Users.updateById(req.user._id, { name, companyName, phone, address, companyLogo });
    const { password: _, ...safeUser } = updated;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Change password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = Users.findById(req.user._id);
    if (user.password !== currentPassword) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    Users.updateById(req.user._id, { password: newPassword });
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

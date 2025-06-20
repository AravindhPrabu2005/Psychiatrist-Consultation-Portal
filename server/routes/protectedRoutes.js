const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(400).json({ error: 'Invalid token' });
  }
};

router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});

module.exports = router;

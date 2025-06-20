const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const generateToken = (user, isAdmin) => {
  return jwt.sign(
    { id: user._id, email: user.email, isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

router.post('/register', upload.single('profilePhoto'), async (req, res) => {
  try {
    const {
      name, email, password, gender, age, dob, phone, address
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl = '';
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'user_photos' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      age,
      dob,
      phone,
      address,
      profilePhoto: imageUrl
    });

    await user.save();
    res.json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/admin/register', upload.single('profilePhoto'), async (req, res) => {
  try {
    const {
      name, email, password, gender, experienceYears, specialization
    } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ error: 'Admin already exists' });

    let imageUrl = '';
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'admin_photos' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      gender,
      profilePhoto: imageUrl,
      experienceYears,
      specialization
    });

    await admin.save();
    res.json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Admin Registration Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = generateToken(user, false);
    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        isAdmin: false,
        isLoggedIn: true,
        email: user.email
      }
    });
  }

  const admin = await Admin.findOne({ email });
  if (admin && await bcrypt.compare(password, admin.password)) {
    const token = generateToken(admin, true);
    return res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        isAdmin: true,
        isLoggedIn: true,
        email: admin.email
      }
    });
  }

  res.status(401).json({ success: false, error: 'Invalid credentials' });
});


// profile routes

router.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.get('/admins/:id', async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  res.json(admin);
});
router.get('/admins', async (req, res) => {
  const admins = await Admin.find();
  res.json(admins);
});



module.exports = router;

const express = require('express');
const router = express.Router();
const pg = require("pg"); 
const bcrypt = require('bcrypt');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const verifyToken = require('../middleware/verifyToken');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// إعداد multer لحفظ الصور في server/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit بقدر ازيد حجمهااا
  fileFilter: function (req, file, cb) {
    const allowed = /jpeg|jpg|png/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

// GET profile (current user)
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, username, email, role, profile_pic, created_at FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /profile  (multipart/form-data) -> update name, email, password (optional) and profile_pic (optional)
router.put('/', verifyToken, upload.single('profilePic'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, password } = req.body;
    let profilePicPath = null;

    const emailCheck = await pool.query('SELECT id FROM users WHERE email=$1 AND id <> $2', [email, userId]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // if file uploaded, set path
    if (req.file) {
      profilePicPath = `/uploads/${req.file.filename}`;
    }

    // fetch current user to maybe remove old pic
    const current = await pool.query('SELECT profile_pic FROM users WHERE id = $1', [userId]);
    if (current.rows.length === 0) {
      // remove uploaded file if user not found
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'User not found' });
    }

    // build update query dynamically
    const fields = [];
    const values = [];
    let idx = 1;

    if (username) {
      fields.push(`username = $${idx++}`);
      values.push(username);
    }
    if (email) {
      fields.push(`email = $${idx++}`);
      values.push(email);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push(`password = $${idx++}`);
      values.push(hashed);
    }
    if (profilePicPath) {
      fields.push(`profile_pic = $${idx++}`);
      values.push(profilePicPath);
    }

    if (fields.length === 0) {
      // nothing to update
      // clean uploaded file if any
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'No data provided for update' });
    }

    values.push(userId); // last param for WHERE
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, username, email, role, profile_pic, created_at`;
    const updated = await pool.query(query, values);

    // if new profile pic uploaded and old one exists, remove old file
    if (profilePicPath && current.rows[0].profile_pic) {
      try {
        const oldPath = path.join(__dirname, '..', current.rows[0].profile_pic);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (e) {
        console.warn('Failed to remove old profile pic:', e.message);
      }
    }

    res.json({ user: updated.rows[0] });
  } catch (err) {
    console.error(err);
    // multer file error handling: if multer failed and file exists, remove
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch(e){}
    }
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;

const express = require("express");
const pg = require("pg");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/verifyToken");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const router = express.Router();


// Get all users
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, role FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/users/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, email,role } = req.body;
  try {
    await pool.query(
      'UPDATE users SET username = $1, email = $2 , role = $3 WHERE id = $4',
      [username, email, role, id]
    );
    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
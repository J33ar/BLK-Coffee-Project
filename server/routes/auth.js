const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pg = require("pg");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET;

// register newUser
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // check Email already exists
    const exists = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // bcrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // newUser
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3 ,$4) RETURNING id, username, email, role",
      [username, email, hashedPassword , "user"]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, email: newUser.rows[0].email, role: newUser.rows[0].role },
      JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.status(201).json({ token, user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
      JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email, role: user.rows[0].role } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;

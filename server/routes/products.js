const express = require("express");
const router = express.Router();
const pg = require("pg");
const verifyToken = require("../middleware/verifyToken");


const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Get all products
router.get("/products",verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product by ID
router.get("/products/:id",verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Create new product
router.post("/products",verifyToken, async (req, res) => {
  const { name, description, price, image_url, in_stock, category } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO products (name, description, price, image_url, in_stock, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, description, price, image_url, in_stock, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update product
router.put("/products/:id",verifyToken, async (req, res) => {
  const id = req.params.id;
  const { name, description, price, image_url, in_stock, category } = req.body;
  try {
    const result = await pool.query(
      "UPDATE products SET name = $1, description = $2, price = $3, image_url = $4, in_stock = $5 ,category = $6 WHERE id = $7 RETURNING *",
      [name, description, price, image_url, in_stock, category, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
router.delete("/products/:id",verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;

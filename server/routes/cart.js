const express = require("express");
const pg = require("pg");
const verifyToken = require("../middleware/verifyToken");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const router = express.Router();

// 🛒 إضافة منتج للسلة
router.post("/add", verifyToken, async (req, res) => {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    try {
        const existing = await pool.query(
            "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
            [user_id, product_id]
        );

        if (existing.rows.length > 0) {
            await pool.query(
                "UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3",
                [quantity, user_id, product_id]
            );
        } else {
            await pool.query(
                "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)",
                [user_id, product_id, quantity]
            );
        }

        res.json({ message: "Product added to cart successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// 📄 عرض سلة المستخدم
router.get("/", verifyToken, async (req, res) => {
    const user_id = req.user.id;
    try {
        const cart = await pool.query(
            `SELECT cart.id, products.name, products.price, products.image_url , cart.quantity
             FROM cart
             JOIN products ON cart.product_id = products.id
             WHERE cart.user_id = $1`,
            [user_id]
        );
        res.json(cart.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✏️ تعديل الكمية
router.put("/:id", verifyToken, async (req, res) => {
    const { quantity } = req.body;
    try {
        await pool.query("UPDATE cart SET quantity = $1 WHERE id = $2", [
            quantity,
            req.params.id,
        ]);
        res.json({ message: "Quantity updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ❌ حذف عنصر من السلة
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        await pool.query("DELETE FROM cart WHERE id = $1", [req.params.id]);
        res.json({ message: "Item removed from cart" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

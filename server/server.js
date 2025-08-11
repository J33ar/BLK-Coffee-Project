const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const pg = require('pg');
const path = require('path');
const verifyToken = require("./middleware/verifyToken");

const app = express();
const PORT = process.env.PORT || 5000;
// const client = new pg.Client(DATABASE_URL);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("BLK Coffee API is running ☕");
});


app.get('/dashboard', verifyToken, async (req, res) => {
  try {
    // أي بيانات خاصة ترجعها هون
    res.json({ message: `Welcome ${req.user.email}!` });
  } catch (err) {
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});


//Route
const products = require("./routes/products");
const authRoutes = require("./routes/auth");
const AdminRouts = require("./routes/admin");
const profileRoute = require('./routes/profile');
const CartRouts = require('./routes/cart');

app.use("/auth", authRoutes);
app.use("/api", products);
app.use("/admin", AdminRouts);
app.use('/profile', profileRoute);
app.use('/cart', CartRouts);


pool.connect()
  .then(() => {
    app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`); 
});

  })
  .catch((err) => {
    console.error("Could not connect to database:", err);
  });

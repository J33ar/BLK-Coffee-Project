import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import LogoutButton from "../../components/LogoutButton";
import './NavbarBLK.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const token = localStorage.getItem("token");

  let role = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      role = payload.role; 
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  // دالة لجلب عدد المنتجات
  const fetchCartCount = () => {
    if (token) {
      axios.get("http://localhost:5000/cart", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setCartCount(res.data.length);
      })
      .catch(err => console.error(err));
    }
  };

  // جلب أولي عند فتح الصفحة
  useEffect(() => {
    fetchCartCount();

    // الاستماع لحدث تحديث السلة
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => {
      window.removeEventListener("cartUpdated", fetchCartCount);
    };
  }, [token]);

  return (
    <div className="dashboard-header">
      <div className="logo-container">
        <Link to= "/dashboard"><img src="/LogoBLK.png" alt="BLK Logo" /></Link>
      </div>

      <div className="header-actions">
        {role === "admin" && (
          <Link to="/AdminUsers" className="bt">ADMIN USERS</Link>
        )}

        <Link to="#" className="bt">CONTACT US</Link>

        {token &&(<>
          <div style={{ position: "relative", marginRight: "15px" }}>
          <Link to="/cart" style={{ color: "#E3E3E3" }}>
            <FaShoppingCart size={33} style={{ cursor: "pointer" }} />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-10px",
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "0.75rem",
                  fontWeight: "bold"
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        <div style={{ position: "relative" }}>
          <FaUserCircle
            size={33}
            style={{ cursor: "pointer",color:"#E3E3E3" }}
            onClick={() => setOpen(!open)}
          />
          {open && (
            <div
              style={{
                position: "absolute",
                right: 0,
                marginTop: "8px",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "5px",
                boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                width: "150px",
                zIndex: 1000,
              }}
            >
              <div style={{ padding: "10px", cursor: "pointer" }}>
                <i>
                  <Link to="/UserProfile" style={{ textDecoration: "none", color: "black" }}>
                    Profile
                  </Link>
                </i>
              </div>
              <div style={{ padding: "10px", cursor: "pointer" }}>
                <i><LogoutButton style={{ textDecoration: "none", color: "black"}} /></i>
              </div>
            </div>
          )}
        </div>
        </>)}

      </div>
    </div>
  );
}

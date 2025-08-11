import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Cart.css";
import Navbar from "../NavbarBLK/NavbarBLK";

export default function Cart() {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/cart", {
            headers: { Authorization: `Bearer ${token}` },
        });
        setCart(res.data);
    };

    const updateQuantity = async (id, quantity) => {
        const token = localStorage.getItem("token");

        if (quantity > 0) {
            await axios.put(
                `http://localhost:5000/cart/${id}`,
                { quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCart(prevCart =>
                prevCart.map(item =>
                    item.id === id ? { ...item, quantity } : item
                )
            );

        } else {
            await axios.delete(
                `http://localhost:5000/cart/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCart(prevCart =>
                prevCart.filter(item => item.id !== id)
            );
        }
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };
    return (
        <>
            <Navbar/>
            <div className="cart-container">
                <h2>🛒 Your Cart</h2>
                {cart.length === 0 ? (
                    <p>Your cart is empty</p>
                ) : (
                    <>
                        {cart.map((item) => (
                            <div key={item.id} className="cart-item">
                                <img src={item.image_url} alt={item.name} />
                                <span className="cart-name">{item.name}</span>
                                <span className="cart-price">${item.price}</span>
                                <div className="cart-quantity">
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                </div>
                            </div>
                        ))}

                        <div className="cart-summary">
                            <h3>Total: ${getTotalPrice().toFixed(2)}</h3>
                            <button className="confirm-btn" onClick={() => alert("Soon")}> Confirm Order</button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

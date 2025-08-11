// src/pages/Login.js
import { useState } from 'react';
import axios from 'axios';
import'./Login.css';
import { Link } from 'react-router-dom';
import Navbar from '../NavbarBLK/NavbarBLK';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post('http://localhost:5000/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);

    const payload = JSON.parse(atob(res.data.token.split(".")[1]));
    const userRole = payload.role;

    // alert("Login successful");

    if (userRole === "admin") {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/dashboard";
    }
  } catch (err) {
    alert(err.response?.data?.error || "Login failed");
  }
};

  return (
    <>    <Navbar/>
    <div className="profile-fancy-containerr">
        <div className="profile-header">


            <h1 className="profile-name">Login!</h1>
            <p className="profile-role"></p>
        </div>

        <form className="profile-form" onSubmit={handleLogin}>
            <label>
            Email
<input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />  
            </label>

            <label>
            Password
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>

            <button type="submit" className="save-btnn">Login</button>
        </form>
        <Link to="/register" className="btnn">Create your Account</Link>
        </div>
      </>

  );
}

export default Login;

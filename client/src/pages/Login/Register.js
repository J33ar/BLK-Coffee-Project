// src/pages/Register.js
import { useState } from 'react';
import axios from 'axios';
import'./Login.css';
import { Link } from 'react-router-dom';
import Navbar from '../NavbarBLK/NavbarBLK';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/auth/register', { username, email, password });
      localStorage.setItem('token', res.data.token);
      // alert("Registration successful");
      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };


  return (
 <>    <Navbar/>
        <div className="profile-fancy-containerr">
        <div className="profile-header">


            <h1 className="profile-name">Register!</h1>
            <p className="profile-role"></p>
        </div>

        <form className="profile-form" onSubmit={handleRegister}>
            <label>
            Username
<input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>

            <label>
            Email
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            <label>
            Password
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>

            <button type="submit" className="save-btnn">Register</button>
        </form>
        <Link to="/login" className="btnn">Go Login</Link>
        </div>
        </>
  );
}

export default Register;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './UserProfile.css';
import Navbar from '../NavbarBLK/NavbarBLK';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    profilePicFile: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setFormData({
        username: res.data.username,
        email: res.data.email,
        password: '',
        profilePicFile: null,
      });
    } catch {
      Swal.fire('Error', 'Failed to fetch profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicFile') {
      setFormData((prev) => ({ ...prev, profilePicFile: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    if (formData.password) data.append('password', formData.password);
    if (formData.profilePicFile) data.append('profilePic', formData.profilePicFile);

    try {
      await axios.put('http://localhost:5000/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      Swal.fire('Success', 'Profile updated successfully', 'success');
      fetchProfile();
      setFormData((prev) => ({ ...prev, password: '', profilePicFile: null }));
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Update failed', 'error');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
            <Navbar/>

        <div className="profile-fancy-container">
        <div className="profile-header">
            <div className="profile-pic-wrapper">
            {user.profile_pic ? (
                <img
                src={`http://localhost:5000${user.profile_pic}`}
                alt="Profile"
                className="profile-pic"
                />
            ) : (
                <div className="profile-pic-placeholder">No Image</div>
            )}
            <label htmlFor="upload-btn" className="upload-btn-floating">+</label>
            <input
                type="file"
                id="upload-btn"
                name="profilePicFile"
                accept="image/png, image/jpeg"
                onChange={handleInputChange}
                style={{ display: 'none' }}
            />
            </div>
            <h1 className="profile-name">{user.username}</h1>
            <p className="profile-role">{user.role.toUpperCase()}</p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
            <label>
            Username
            <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
            />
            </label>

            <label>
            Email
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
            />
            </label>

            <label>
            New Password
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
            />
            </label>

            <button type="submit" className="save-btn">Save Changes</button>
        </form>
        </div>
    </>    
  );
}

export default UserProfile;

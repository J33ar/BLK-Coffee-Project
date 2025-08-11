import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './AdminUsers.css';
import Navbar from '../NavbarBLK/NavbarBLK';

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(res.data);
  };

  const handleEdit = async (id, username, email, role) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit User',
      html: `
        <input id="swal-input1" class="swal2-input" value="${username}">
        <input id="swal-input2" class="swal2-input" value="${email}">
        <br><br>
        <select id="swal-input3" class="swal2-input">
        <option value="user" ${role === 'user' ? 'selected' : ''}>User</option>
        <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option>
      </select>
      `,
      confirmButtonColor: "#313131",
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value,
          document.getElementById('swal-input3').value
        ];
      }
    });

    if (formValues) {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/admin/users/${id}`,
        { username: formValues[0], email: formValues[1], role: formValues[2] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "This user will be deleted permanently.",
      icon: 'warning',
      showCancelButton: true,
      iconColor: "#313131",
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: "#313131",
      cancelButtonColor:"#ffffffff",
      customClass: {
         cancelButton: 'my-cancel-btn'
      }
      
    });

    if (confirm.isConfirmed) {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    }
  };

  return (
    <div>
        <Navbar/>
        <div className="admin-container">
        <h2>Users Management</h2>
        <table className="admin-table">
            <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {users.map(u => (
                <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                    <button className="edit-btn" onClick={() => handleEdit(u.id, u.username, u.email)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
  );
}

export default AdminUsers;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import DashboardAdmin from './pages/Dashoboard/Dashboard_Admin';
import DashboardUser from './pages/Dashoboard/Dashboard_User';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Login/Register';
import AdminUsers from './pages/AdminUsers/AdminUsers';
import UserProfile from './pages/UserProfile/UserProfile';
import Cart from './pages/Cart/Cart';

function App() {
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

  return (
    <BrowserRouter>
      <Routes>
        {role === 'admin' && (
          <>
            <Route path='/AdminUsers' element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardAdmin /></ProtectedRoute>} />
          </>
        )}

        {role === 'user' && (
          <>
            <Route path="/dashboard" element={<ProtectedRoute><DashboardUser/></ProtectedRoute>}/>
          </>
        )}
      

        <Route path='/UserProfile' element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/> } />
        <Route path="/cart" element={<ProtectedRoute><Cart/></ProtectedRoute>}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

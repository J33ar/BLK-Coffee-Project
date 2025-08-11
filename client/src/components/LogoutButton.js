import { Link } from 'react-router-dom';

function LogoutButton({style}) {

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/login";
  };

  return <Link style={style} to="#" onClick={handleLogout}>Logout</Link>;
}

export default LogoutButton;
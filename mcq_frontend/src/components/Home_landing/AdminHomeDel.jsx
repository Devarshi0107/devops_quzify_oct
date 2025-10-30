import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/'); 
  };

  return (
    <div>
      <h1>Admin Home</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminHome;

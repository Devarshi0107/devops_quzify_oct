


import React from 'react';
import { FaBars } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "./Admin_home.css";
import logo from '../../assets/icons/logo2.png'; 
import { Toaster } from '../../utils/Toaster';
const AdminNavbar = ({ toggleSidebar, onLogout, isLoggedIn, userType }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Toaster.success("Logout Successfully");
    onLogout();
    navigate('/');
    
  };

  if (!isLoggedIn || userType !== "admin") {
    return null;
  }

  return (
    <div className="admin-navbar">
      <div className="app-name">
        <span className="menu-button" onClick={toggleSidebar}>
          <FaBars />
        </span>
        <div className="flex-shrink-0 flex items-center">
                      <img 
                        src={logo} 
                        alt="Quizify Logo" 
                        className="h-12 w-12 object-cover rounded-full shadow-sm border-2 border-white 
                        hover:border-red-200 transition-all"
                      />
                      <h1 className="ml-3 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 font-montserrat tracking-wide">
                        QUIZIFY
                      </h1>
                    </div>
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default AdminNavbar;
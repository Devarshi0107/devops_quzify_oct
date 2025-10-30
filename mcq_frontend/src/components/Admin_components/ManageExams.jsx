

import React, { useState } from 'react';
import AdminNavbar from './AdminNavbar'; 
import AdminSidebar from './AdminSidebar'; 
import "./Admin_home.css"; 

const ManageExams = ({ onLogout, isSidebarCollapsed, toggleSidebar  }) => {
  const [activeContent, setActiveContent] = useState('manageExams');

  

  const handleMenuClick = (content) => {
    setActiveContent(content); 
  };

  return (
    <div>
      <AdminNavbar toggleSidebar={toggleSidebar} onLogout={onLogout} />

      <div className={`admin-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      
<AdminSidebar isCollapsed={isSidebarCollapsed} handleMenuClick={handleMenuClick} />
        <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <h2>Manage Exams</h2>
          <p>This is the Manage Exams section.</p>
        </main>
      </div>
    </div>
  );
};

export default ManageExams;

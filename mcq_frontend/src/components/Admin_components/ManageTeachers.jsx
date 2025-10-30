

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import './Admin_home.css';
import './ManageTeachers.css';

const ManageTeachers = ({ onLogout, isSidebarCollapsed, toggleSidebar   }) => {
  const [activeContent, setActiveContent] = useState('manageTeachers');
  const navigate = useNavigate();


  const handleMenuClick = (content) => {
    setActiveContent(content);
  };

 
  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleMakeCredentialClick = () => {
    navigate('/admin/manage-teachers/make-credential'); 
  };

  const handleTeacherDetailsClick = () => {
    navigate('/admin/manage-teachers/teacher-details'); 
  };

  return (
    <div>
    
      <AdminNavbar toggleSidebar={toggleSidebar} onLogout={handleLogout} />

     
      <div className={`admin-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
     
<AdminSidebar isCollapsed={isSidebarCollapsed} handleMenuClick={handleMenuClick} />
     
        <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}   min-h-screen flex items-center justify-center p-4` }>
          <div className="card-container flex flex-wrap justify-center gap-8 max-w-4xl w-full">
            <div className="card card min-w-[300px] max-w-md w-full aspect-square cursor-pointer" onClick={handleMakeCredentialClick}>
              <div className="card-bg"></div>
              <div className="card-title">Create Credential For Teacher</div>
              <div className="card-date-box"></div>
            </div>

           
            <div className="card min-w-[300px] max-w-md w-full aspect-square cursor-pointer" onClick={handleTeacherDetailsClick}>
              <div className="card-bg"></div>
              <div className="card-title">All Teacher Details</div>
              <div className="card-date-box"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageTeachers;


import React from 'react';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaBook, FaUser, FaUserCheck } from 'react-icons/fa';
import './Admin_home.css';

const AdminSidebar = ({ isCollapsed, handleMenuClick }) => {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-menu">
        <Link to="/admin-home" onClick={() => handleMenuClick('dashboard')}>
          <FaTachometerAlt /> {isCollapsed ? '' : 'Dashboard'}
        </Link>
        <Link to="/admin/manage-teachers" onClick={() => handleMenuClick('manageTeachers')}>
          <FaUserCheck /> {isCollapsed ? '' : 'Manage Teachers'}
        </Link>
        <Link to="/admin/manage-students" onClick={() => handleMenuClick('manageStudents')}>
          <FaUser /> {isCollapsed ? '' : 'Change Password'}
        </Link>
        <Link to="/admin/manage-exams" onClick={() => handleMenuClick('manageExams')}>
          <FaBook /> {isCollapsed ? '' : 'Manage Exams'}
        </Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;

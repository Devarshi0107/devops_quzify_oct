import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import './Admin_home.css'; 
import './TeacherDetails.css'; 
const API = import.meta.env.VITE_BACKEND_API_URL;

const TeacherDetails = ({ onLogout, isSidebarCollapsed, toggleSidebar   }) => {
  const [teacherDetails, setTeacherDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
 const handleMenuClick = (content) => {
    setActiveContent(content); 
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      navigate('/'); 
    } else {
      console.error("onLogout function is not defined");
    }
  };

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
            const token = localStorage.getItem('token');

        const response = await fetch(
          // 'http://localhost:3001/api/allteachers'
          `${API}/api/allteachers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }}

        );
        if (!response.ok) {
          throw new Error('Failed to fetch teacher details');
        }
        const data = await response.json();
        setTeacherDetails(data); 
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, []);

  return (
    <div>
      <AdminNavbar toggleSidebar={toggleSidebar} onLogout={handleLogout} />

      <div className={`admin-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
<AdminSidebar isCollapsed={isSidebarCollapsed} handleMenuClick={handleMenuClick} />

        <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          {loading ? (
            <p>Loading teacher details...</p>
          ) : (
            <div className="teacher-details-container">
              <h1>Teacher Details</h1>
              {teacherDetails && teacherDetails.length > 0 ? (
                <div className="teacher-list">
                  {teacherDetails.map((teacher, index) => (
                    <div className="teacher-card" key={index}>
                      <h3>{teacher.teacherName}</h3>
                      <p><strong>Email:</strong> {teacher.email}</p>
                      <p><strong>Branch:</strong> {teacher.branch}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No teacher details available.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherDetails;



//above wrking correct wihtout logout button
//fixing abvoe


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import './Admin_home.css'; 
import './MakeCredential.css'; 
import { Toaster } from '../../utils/Toaster';

const API = import.meta.env.VITE_BACKEND_API_URL;

const MakeCredential = ({ onLogout, isSidebarCollapsed, toggleSidebar }) => {
  const [teacherName, setTeacherName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
 const handleMenuClick = (content) => {
    setActiveContent(content);
  };
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const randomPassword = generateRandomPassword();
    setLoading(true);
    
    try {
      const response = await fetch(
        // 'http://localhost:3001/api/teacher/credentials/create'
        `${API}/api/teacher/credentials/create`
        , {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherName, email, phoneNumber, branch, password: randomPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        // window.alert(`Teacher created successfully! An email has been sent to ${email} with credentials.`);
        Toaster.success(`Teacher created successfully! An email has been sent to ${email} with credentials.`);
      } else {
        if (data.message.includes("email already registered")) {
          // window.alert(`Unable to register: The email ${email} is already registered.`);
          Toaster.error(`Unable to register: The email ${email} is already registered.`);
        } else if (data.message.includes("phone number already registered")) {
          // window.alert(`Unable to register: The phone number ${phoneNumber} is already registered.`);
          Toaster.error(`Unable to register: The phone number ${phoneNumber} is already registered.`);
        } else {
          // window.alert(`Error: ${data.message}`);
          Toaster.error(`Error: ${data.message}`);
        }
      }
    } catch (error) {
      // window.alert('Failed to create user or send email.');
      Toaster.error('Failed to create user or send email.');
    } finally {
      setLoading(false);
      navigate('/admin/manage-teachers');
    }
  };

  const handleLogout = () => {
    if (onLogout) { 
      onLogout(); 
      navigate('/'); 
    } else {
      console.error("onLogout function is not defined");
    }
  };

  return (
    <div>
      <AdminNavbar toggleSidebar={toggleSidebar} onLogout={handleLogout} />

      <div className={`admin-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* <AdminSidebar isSidebarCollapsed={isSidebarCollapsed} handleMenuClick={() => {}} /> */}
<AdminSidebar isCollapsed={isSidebarCollapsed} handleMenuClick={handleMenuClick} />

        <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <form className="make-credential-form" onSubmit={handleSubmit}>
            <label htmlFor="teacherName">Teacher Name:</label>
            <input
              type="text"
              id="teacherName"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              required
            />

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />

            <label htmlFor="branch">Branch:</label>
            <input
              type="text"
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>Create Credential</button>
          </form>

          {loading && <p>Getting response...</p>}
        </main>
      </div>
    </div>
  );
};

export default MakeCredential;

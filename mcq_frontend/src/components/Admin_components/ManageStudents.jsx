

import React, { useState } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import "./Admin_home.css";
import { Toaster } from '../../utils/Toaster';
const API = import.meta.env.VITE_BACKEND_API_URL;

const ManageProfile = ({ onLogout, isSidebarCollapsed, toggleSidebar }) => {
  const [activeContent] = useState('manageProfile');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!oldPassword || !newPassword) {
      setError('Both old and new passwords are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        // 'http://localhost:3001/api/admin/change-password'
        `${API}/api/admin/change-password`
        , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        // alert(data.message);
        Toaster.success(data.message);
        setOldPassword('');
        setNewPassword('');
      } else {
        setError(data.error || 'Failed to change password. Please try again.');
      }
    } catch (error) {
      setError('An error occurred while changing the password. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div>
      <AdminNavbar toggleSidebar={toggleSidebar} onLogout={onLogout} />

      <div className={`admin-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <AdminSidebar isCollapsed={isSidebarCollapsed} />

        <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''} min-h-screen flex items-center justify-center`}>
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>
            
            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm bg-red-100 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageProfile;
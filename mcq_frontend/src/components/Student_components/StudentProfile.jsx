import React, { useState } from "react";
import StudentNavbar from "./StudentNavbar";
import StudentSidebar from "./StudentSidebar";
import { User, Mail, Lock, Phone, Camera, Save, Check, Edit } from "lucide-react";

const StudentProfile = ({onLogout}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [activeMenu, setActiveMenu] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "John Smith",
    email: "john.t@university.edu",
    phone: "+1 (555) 123-4567",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        student={{ name: "John Smith" }} 
        isLoggedIn={true}
        userType="student"
        onLogout={onLogout}
      />
      <StudentSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <main
        className={`absolute transition-all duration-200 ${
          isSidebarOpen ? "left-60" : "left-16"
        } right-0 top-20 bottom-0 px-8`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Header Card */}
          <div className="bg-white overflow-hidden rounded-xl shadow-sm mb-6">
            {/* Banner */}
            
            <div className="h-32 bg-gradient-to-br from-orange-500 to-pink-500 relative">
              {/* Edit Profile Button */}
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="absolute top-4 right-4 flex items-center gap-2 bg-white text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 shadow-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="relative -mt-16 mb-4 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center overflow-hidden">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{formData.username}</h2>
                <p className="text-gray-500">Student</p>
              </div>

              {/* Status Indicators */}
              <div className="flex justify-center gap-4 text-sm">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                  <Check className="w-4 h-4" /> Verified Student
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Username */}
              {/* <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="pl-5 w-full rounded-lg border border-gray-300 p-3 text-gray-900 disabled:bg-gray-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div> */}

              {/* Email */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="pl-5 w-full rounded-lg border border-gray-300 p-3 text-gray-900 disabled:bg-gray-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Phone */}
              {/* <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="pl-5 w-full rounded-lg border border-gray-300 p-3 text-gray-900 disabled:bg-gray-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div> */}

              {/* Password Section */}
              {/* {isEditing && (
                <div className="col-span-2 border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                        </div>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="pl-5 w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                        </div>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="pl-5 w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )} */}
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};

export default StudentProfile;

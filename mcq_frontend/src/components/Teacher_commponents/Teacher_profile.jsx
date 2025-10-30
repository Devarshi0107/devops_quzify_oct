import React, { useState,useEffect } from "react";
import TeacherNavbar from "./TeacherNavbar";
import TeacherSidebar from "./TeacherSidebar";
import { User, Mail, Lock, Phone, Save, Check, Edit } from "lucide-react";
import { jwtDecode } from "jwt-decode"; // Add this import
const API = import.meta.env.VITE_BACKEND_API_URL;




const TeacherProfile = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeContent, setActiveContent] = useState("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState(""); 
  const [isLoading, setIsLoading] = useState(true); 
  const [teacherFullEmail, setTeacherFullEmail] = useState(""); 



  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error("No token found");
      return;
    }
  
    try {
      const decoded = jwtDecode(token);
      const emailParts = decoded.email.split("@");
      
      if (!decoded.email) {
        throw new Error("Email not found in token");
      }
      
      setTeacherEmail(emailParts[0]);
      setTeacherFullEmail(decoded.email); 

      setFormData(prev => ({
        ...prev,
        email: decoded.email
      }));
    } catch (error) {
      console.error("Token error:", error);
      setErrorMessage("Session expired. Please login again.");
      
      setTimeout(() => {
        onLogout?.();
      }, 3000);
    }
    finally {
      setIsLoading(false);
    }
  }, [onLogout]);

  

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token"); 
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        // "http://localhost:3001/api/teacher/change-password"
        `${API}/api/teacher/change-password`
        
        , {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Password update failed");

   
      setFormData({ ...formData, currentPassword: "", newPassword: "" });
      setSuccessMessage("Password updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(error.message);
      console.error("Password update error:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  return (
    <div>
      <TeacherNavbar
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        
        isLoggedIn={true}
        userType="teacher"
        onLogout={onLogout}
      />
      <TeacherSidebar
        isSidebarOpen={isSidebarOpen}
        activeContent={activeContent}
        setActiveContent={setActiveContent}
      />

      <main
        className={`absolute transition-all duration-200 ${
          isSidebarOpen ? "left-60" : "left-16"
        } right-0 top-20 bottom-0 px-8`}
      >
           <form onSubmit={handleProfileUpdate}>
        <div className="teacher-profile">
          {/* Profile Header */}
          <div className="bg-gradient-to-r  from-orange-500 to-pink-500 text-white text-center py-12 rounded-xl shadow-lg relative">
            <h1 className="text-4xl font-extrabold uppercase tracking-wide">{teacherEmail || formData.email}</h1>
            <p className="text-sm text-gray-200 mt-2">Manage your account settings and preferences</p>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-4 right-6 flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 shadow-md transition-all"
            >
              <Edit className="w-4 h-4" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
            {/* Add message display */}
            {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                  {successMessage}
                </div>
              )}
          </div>

          {/* Profile & Password Form */}
          <div className="bg-white p-8 rounded-xl shadow-md mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Username */}
           
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    // onChange={handleInputChange}
                    disabled
                    className="pl-5 w-full rounded-lg border border-gray-300 p-3 text-gray-900 disabled:bg-gray-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
             
            </div>

            {/* Password Section */}
            {isEditing && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Current Password */}
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
                        className="pl-5 w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* New Password */}
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
                        className="pl-5 w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
        </form>
      </main>
    </div>
  );
};

export default TeacherProfile;

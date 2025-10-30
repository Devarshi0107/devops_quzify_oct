
import React, { useState, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import logo from '../../assets/icons/logo2.png';
import { Toaster } from '../../utils/Toaster';


const TeacherNavbar = ({ toggleSidebar, onLogout, isLoggedIn, userType, student }) => {
  const navigate = useNavigate();
  const [teacherInfo, setTeacherInfo] = useState({ 
    emailPart: '', 
    role: '' 
  });

  useEffect(() => {
    if (isLoggedIn && userType === "teacher") {
      const token = localStorage.getItem("token");
      try {
        const decoded = jwtDecode(token);
        const emailParts = decoded.email.split('@');
        setTeacherInfo({
          emailPart: emailParts[0] || decoded.email,
          role: decoded.role
        });
      } catch (err) {
        console.error("Token decoding failed:", err);
        onLogout?.();
      }
    }
  }, [isLoggedIn, userType, onLogout]);

  const handleLogout = () => {
    if (onLogout) {
      Toaster.success("Logout Successfully");
      onLogout(); 
    }
    navigate('/'); 
  };

  if (!isLoggedIn || userType !== "teacher") {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50 px-4">
      <div className="h-full flex items-center justify-between max-w-full mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar} 
            className="p-2 hover:bg-stone-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
            <div className="flex items-center">
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
        </div>

        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 pl-4 border-l">
            <div className="text-right">
              <div className="text-sm font-medium">{teacherInfo.emailPart || "Teacher ID"}</div>
              <div className="text-xs text-stone-500">{teacherInfo.role ? `${teacherInfo.role.charAt(0).toUpperCase()}${teacherInfo.role.slice(1)}` : "Teacher"}</div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg text-white flex items-center justify-center font-medium">
            {teacherInfo.emailPart?.[0]?.toUpperCase() || "T"}
            </div>
          </div>

          <button
            className="p-2 hover:bg-stone-100 rounded-lg flex items-center"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span className="ml-2 text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TeacherNavbar;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from '../../utils/Toaster';

const API = import.meta.env.VITE_BACKEND_API_URL;

const TeacherLogin = ({ setIsLoggedIn, setUserType }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        // 'http://localhost:3001/api/teacher/login'
        `${API}/api/teacher/login`
        , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.role);
        localStorage.setItem('loggedIn', 'true');
        setIsLoggedIn(true);
        setUserType(data.role);
        navigate('/teacher_home');
        Toaster.success(data.message);
      } else {
        // setError(data.message);
        Toaster.error(data.message);
      }
    } catch (error) {
      // setError('An error occurred. Please try again later.');
      Toaster.error('An error occurred. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div style={{backgroundColor:'#213547'}} className="min-h-screen flex items-center justify-center">   
      <div className="relative w-full mt-10 max-w-md px-6 py-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl mx-4">
        <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 transform rotate-12 hover:rotate-0 transition-transform duration-300">
          
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-14 w-14 text-white">
            <circle cx="12" cy="5" r="2"></circle>
            <path d="M10 20v-6h4v6"></path>
            <path d="M9 14h-3l3-3"></path>
            <rect x="15" y="9" width="6" height="4" rx="1"></rect>
          </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-br from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Faculty Portal
          </h2>
          <p className="mt-3 text-gray-600">
            Access your dashboard to manage quizzes and student progress
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-hover:text-indigo-600">
                Faculty Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none"
                placeholder="faculty.name@college.edu"
              />
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-hover:text-indigo-600">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 transform hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-br from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            }`}
          >
            {loading ? "Authenticating..." : "SIGN IN"}
          </button>
        </form>

       
      </div>
    </div>
  );
};

export default TeacherLogin;

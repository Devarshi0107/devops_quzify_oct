
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from '../../utils/Toaster';
const API = import.meta.env.VITE_BACKEND_API_URL;

const StudentLogin = ({ setIsLoggedIn, setUserType }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        // "http://localhost:3001/api/auth/login"
        `${API}/api/auth/login`
        , {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userType", "student");
        localStorage.setItem("loggedIn", true);
        setIsLoggedIn(true);
        setUserType("student");
        navigate("/student_dashboard");
        Toaster.success(data.message);
      } else {
        // setError(data.message);
        Toaster.error(data.message);
      }
    } catch (error) {
      // setError("An error occurred. Please try again later.");
      Toaster.error("An error occurred. Please try again later.");
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        // "http://localhost:3001/api/auth/send-otp"
        `${API}/api/auth/send-otp`
        , {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registerEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        // setError("OTP sent successfully! Please check your email.");
        Toaster.success("OTP sent successfully! Please check your email.");
      } else {
        // setError(data.message);
        Toaster.error(data.message);
      }
    } catch (error) {
      // setError("Failed to send OTP. Please try again.");
      Toaster.error("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

 

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    const emailRegex = /^(D\d{2}|\d{2})(CS|IT|CE)\d{3}@charusat\.edu\.in$/i;
    if (!emailRegex.test(registerEmail)) {
      // setError("Invalid email format! Use format like D23IT168@charusat.edu.in");
      Toaster.error("Invalid email format! Use format like D23IT168@charusat.edu.in or 22IT001#charusat.edu.in");
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch(
        // "http://localhost:3001/api/auth/verifyAndSignUp"
        `${API}/api/auth/verifyAndSignUp`

        , {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: registerEmail.trim(), 
          otp, 
          password: registerPassword 
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        // setError("Registration successful! Please log in.");
        Toaster.success("Registration successful! Please log in.");
        setTimeout(() => {
          setRegisterMode(false);
          setError("");
        }, 2000);
      } else {
        // setError(data.message || "Registration failed.");
        Toaster.error(data.message || "Registration failed.");
      }
    } catch (error) {
      // setError("Network error. Please try again.");
      Toaster.error("Network error. Please try again.");
    }
    setLoading(false);
  };
  
  return (
    // <div className="min-h-screenflex items-center justify-center ">
    <div style={{backgroundColor:'#213547'}} className="min-h-screen flex items-center justify-center ">  
      <div className="relative w-full mt-10 max-w-md px-6 py-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl mx-4">
      
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 transform rotate-12 hover:rotate-0 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-br from-orange-500 to-pink-500 bg-clip-text text-transparent">
            {registerMode ? "Join QUIZIFY" : "Welcome Back"}
          </h2>
          <p className="mt-3 text-gray-600">
            {registerMode 
              ? "Create your account to start your journey (e.g., 22ITXXX or D23ITXXX)" 
              : "Login to access your quizzes and progress"}
          </p>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            error.includes("successful") 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          }`}>
            {error}
          </div>
        )}

        {!registerMode ? (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate autoComplete="off">
            <div className="space-y-4">
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-hover:text-blue-600">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                  placeholder="your.email@college.edu"
                />
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-hover:text-blue-600">
                  Password
                  
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 transform hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-gradient-to-br from-orange-500 to-pink-500 hover:from-orange-700 hover:to-pink-600"
              }`}
            >
              {loading ? "Please wait..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6" noValidate autoComplete="off">
            <div className="space-y-4">
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-hover:text-blue-600">
                  College Email
                </label>
                <input
                  type="email"
                  // type="text"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                  placeholder="your.email@college.edu"
                />
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 transform hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-br from-orange-500 to-pink-500 hover:from-orange-700 hover:to-pink-600"
                  }`}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              ) : (
                <>
                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-hover:text-blue-600">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                      placeholder="Enter the OTP sent to your email"
                    />
                  </div>

                 
                  <div className="relative group">
  <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-hover:text-blue-600">
    Create Password
    <span className="block text-xs text-gray-500">(Alphanumeric, 4-10 characters recommended)</span>
  </label>
  <div className="relative">
    <input
      type={showRegisterPassword ? "text" : "password"}
      required
      value={registerPassword}
      onChange={(e) => setRegisterPassword(e.target.value)}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none pr-10"
      placeholder="Create a strong password"
    />
    <button
      type="button"
      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
      className="absolute right-3 top-3 text-sm text-gray-500 hover:text-blue-600 focus:outline-none"
    >
      {showRegisterPassword ? "Hide" : "Show"}
    </button>
  </div>
</div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 transform hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      loading 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-gradient-to-br from-orange-500 to-pink-500 hover:from-orange-700 hover:to-pink-600"
                    }`}
                  >
                    {loading ? "Creating Account..." : "Complete Registration"}
                  </button>
                </>
              )}
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setRegisterMode(!registerMode);
              setError("");
            }}
            className="text-blue-600 hover:text-purple-600 font-medium transition-colors duration-300"
          >
            {registerMode
              ? "Already have an account? Sign in"
              : "New to QUIZIFY? Create account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
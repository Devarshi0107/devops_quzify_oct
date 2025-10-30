
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Home_landing/Navbar';
import AdminNavbar from './components/Admin_components/AdminNavbar';
import TeacherNavbar from './components/Teacher_commponents/TeacherNavbar';
import StudentNavbar from './components/Student_components/StudentNavbar';
import AdminHome from './components/Admin_components/Admin_Home';
import ManageExams from './components/Admin_components/ManageExams';
import ManageTeachers from './components/Admin_components/ManageTeachers';
import ManageStudents from './components/Admin_components/ManageStudents';
import MakeCredential from './components/Admin_components/MakeCredential';
import TeacherDetails from './components/Admin_components/TeacherDetails';
import TeacherHome from './components/Teacher_commponents/Teacher_home';
import TeacherProfile from './components/Teacher_commponents/Teacher_profile';
import StudentDashboard from './components/Student_components/Student_home';
import StudentLogin from './components/Home_landing/StudentLogin';
import TeacherLogin from './components/Home_landing/TeacherLogin';
import AdminLogin from './components/Home_landing/AdminLogin';
import About from './components/Home_landing/About';
import Contact from './components/Home_landing/Contact';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home_landing/Home';
import StudentMyExam from './components/Student_components/StudentMyExam_instruction';
import StudentProfile from './components/Student_components/StudentProfile';
import MCQGenerator from './components/Teacher_commponents/MCQGenerator'
import ExamPerformance from './components/Student_components/ExamPerformance'
import ExamLeaderboard from './components/Student_components/leaderboard';
import StudentMyExam_questions from './components/Student_components/StudentMyExam_questions';
import StudentMyExam_instruction from './components/Student_components/StudentMyExam_instruction'
import TeacherExamLeaderboard from './components/Teacher_commponents/leaderboard';
import { ToastContainer } from 'react-toastify';
const API = import.meta.env.VITE_BACKEND_API_URL;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const role = localStorage.getItem('userType');
    if (loggedIn && role) {
      setIsLoggedIn(true);
      setUserType(role);
    } else {
      setIsLoggedIn(false);
      setUserType(null);
    }
    setLoading(false); 
  }, []);  

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserType(null);
    navigate('/');
  };

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <Router>
       <ToastContainer />
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} userType={userType} onLogout={handleLogout} />
        <AdminNavbar isLoggedIn={isLoggedIn} userType={userType} onLogout={handleLogout} toggleSidebar={toggleSidebar} />
        <TeacherNavbar isLoggedIn={isLoggedIn} userType={userType} onLogout={handleLogout} toggleSidebar={() => {}}/>
        <StudentNavbar isLoggedIn={isLoggedIn} userType={userType} onLogout={handleLogout} toggleSidebar={toggleSidebar}/>
        
        <Routes>
          {/* Public Routes */}
          {!isLoggedIn && (
            <>
              {/* <Route path="/" element={<Home />} /> */}
              <Route path="/" element={<StudentLogin setIsLoggedIn={setIsLoggedIn} setUserType={setUserType} />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/teacher" element={<TeacherLogin setIsLoggedIn={setIsLoggedIn} setUserType={setUserType} />} />
              <Route path="/admin" element={<AdminLogin setIsLoggedIn={setIsLoggedIn} setUserType={setUserType} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Admin Routes */}
            {userType === "admin" && (
              <>
                <Route path="/" element={<Navigate to="/admin-home" />} />
                <Route path="/admin-home" element={<AdminHome onLogout={handleLogout} isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                <Route path="/admin/manage-exams" element={<ManageExams isSidebarCollapsed={isSidebarCollapsed}  toggleSidebar={toggleSidebar}/>} />
                <Route path="/admin/manage-teachers" element={<ManageTeachers isSidebarCollapsed={isSidebarCollapsed}  toggleSidebar={toggleSidebar}/>} />
                <Route path="/admin/manage-students" element={<ManageStudents isSidebarCollapsed={isSidebarCollapsed}  toggleSidebar={toggleSidebar}/>} />
                <Route path="/admin/manage-teachers/make-credential" element={<MakeCredential isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                <Route path="/admin/manage-teachers/teacher-details" element={<TeacherDetails isSidebarCollapsed={isSidebarCollapsed}  toggleSidebar={toggleSidebar}/>} />
                
              </>
            )}

            {/* Teacher Routes */}
            {userType === "teacher" && (
              <>
                <Route path="/" element={<Navigate to="/teacher_home" />} />
                <Route path="/teacher_home" element={<TeacherHome isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} onLogout={handleLogout}/>} />
                <Route path="/teacher/profile" element={<TeacherProfile onLogout={handleLogout}/>} />
                <Route path="/teacher/create-exam" element={<MCQGenerator onLogout={handleLogout}/>} />
                <Route path="/teacher/leaderboard/:quizId" element={<TeacherExamLeaderboard onLogout={handleLogout}/>} />

              </>
            )}

            {/* Student Routes */}
            {userType === "student" && (
              <>
              <Route path="/" element={<Navigate to="/student_dashboard" />} />
              <Route path="/student_dashboard" element={<StudentDashboard isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} onLogout={handleLogout}/>} />
              <Route path="/student/My-exam/:id" element={<StudentMyExam_instruction isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} onLogout={handleLogout}/>} />
              <Route path="/student/profile" element={<StudentProfile onLogout={handleLogout}/>} />
              <Route path="/student/examperformance" element={<ExamPerformance onLogout={handleLogout}/>} />
              {/* <Route path="/student/leaderboard" element={<ExamLeaderboard />} /> */}
              <Route path="/student/leaderboard/:quizId" element={<ExamLeaderboard onLogout={handleLogout}/>} />
              <Route path="/student/My-exam/questions" element={<StudentMyExam_questions onLogout={handleLogout}/>} />
              </>
              
            )}

            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;

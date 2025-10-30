

import React, { useState, useEffect } from "react";
import { useNavigate ,useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { Clock, ChevronRight, Flag, Trash2, CheckCircle } from "lucide-react";
import StudentSidebar from "./StudentSidebar";
import StudentNavbar from "./StudentNavbar";
const API = import.meta.env.VITE_BACKEND_API_URL;

const StudentMyExam_instruction = ({ onStartExam ,onLogout }) => {
  const [student, setStudent] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { examData, token } = location.state || {};
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("exams"); // Or appropriate menu key


  useEffect(() => {
    let storedToken = token || localStorage.getItem("token");

    if (!storedToken) {
      console.error("No token found");
      return;
    }

    try {
      const decoded = jwtDecode(storedToken);
      if (decoded.rollNo && decoded.id) {
        setStudent({ rollNo: decoded.rollNo, id: decoded.id });
      }
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }, [token]);

  const handleStartExam = async () => {
    if (!student || !examData) {
      console.error("Student or exam data is missing");
      return;
    }

    try {
      const response = await fetch(
        // "http://localhost:3001/api/student-quiz/start-exam"
        `${API}/api/student-quiz/start-exam`
        
        , {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student: student.id,
          quiz: examData._id,
          endTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start the exam");
      }

      const data = await response.json();
      console.log("Exam started:", data);

      // Call the passed `onStartExam` function if available
      // if (onStartExam) {
      //   onStartExam();
      // }

      // Navigate to exam page with questions
      navigate(`/student/My-exam/questions`, {
        state: { questions: examData.questions, examData  ,
        assigned_set: examData.assigned_sets[student.rollNo],
        sets: examData.sets }
      });
    } catch (error) {
      console.error("Error starting the exam:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <StudentNavbar
        // toggleSidebar={() => {}}
          isSidebarOpen={isSidebarOpen} 
  toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          // toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        student={student ? { name: `Roll No: ${student.rollNo}` } : { name: "Guest" }}
        isLoggedIn={!!student}
        userType="student"
        onLogout={onLogout}
      />

      {/* Sidebar */}
      <StudentSidebar 
      isSidebarOpen={isSidebarOpen} 
      toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} 
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
      />

      {/* Main Content */}
      {/* <main className="absolute transition-all duration-200 left-60 right-0 top-16 bottom-0"> */}
      <main className={`absolute transition-all duration-200 ${isSidebarOpen ? "left-60" : "left-16"} right-0 top-20 bottom-0 px-8 `}>
        <div className="bg-gradient-to-br from-orange-500 to-pink-500 text-white p-4 rounded-t-xl">
          <div className="max-w-7xl mx-10 flex justify-between items-center">
            <h1 className="text-xl font-medium">
              Exam Name: {examData?.exam_name || "Loading..."}
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-medium text-gray-800 mb-6">Instructions:</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-4">
              <li>You have {examData?.questions?.length || 0} questions in this exam.</li>
              <li>Choose the correct answer for each question.</li>
              <li>You have 60 minutes to complete the exam.</li>
              <li>
                This exam is accessible from {examData?.schedule_time_range?.start || "N/A"} to{" "}
                {examData?.schedule_time_range?.end || "N/A"}.
              </li>
              <li>
                Negative Marking: {examData?.negative_marking !== undefined ? examData.negative_marking : "Not specified"}
              </li>
              <li>You cannot change your answers after submitting.</li>
            </ul>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleStartExam}
                className="px-6 py-3 bg-orange-400 text-white rounded-lg hover:bg-orange-600 relative z-10"
              >
                Start Exam
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentMyExam_instruction;


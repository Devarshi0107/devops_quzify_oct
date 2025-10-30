

import React, { useState,useEffect  } from 'react';
import { Download, Trophy, X, BarChart } from 'lucide-react';
import StudentNavbar from './StudentNavbar';
import StudentSidebar from './StudentSidebar';
import { jwtDecode } from "jwt-decode";
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom'; 

const API = import.meta.env.VITE_BACKEND_API_URL;

const ExamPerformance = ({onLogout}) => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendedExams, setAttendedExams] = useState([]);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [quizDetails, setQuizDetails] = useState(null);

  const [selectedExam, setSelectedExam] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('performance');
  


  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const decoded = jwtDecode(token);
  
      if (!decoded.rollNo) {
        setError("Token is missing required data.");
        setLoading(false);
        return;
      }
  
      setStudent({ rollNo: decoded.rollNo });
  
      try {
        const attendedExamsResponse = await fetch(
          // `http://localhost:3001/api/student-quiz/getattended-exam?student=${decoded.id}`
          `${API}/api/student-quiz/getattended-exam?student=${decoded.id}`
          
          ,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (!attendedExamsResponse.ok) {
          throw new Error(`API Error: ${attendedExamsResponse.status} ${attendedExamsResponse.statusText}`);
        }
  
        const attendedExamsData = await attendedExamsResponse.json();
  
        if (!attendedExamsData || !attendedExamsData.results) {
          console.error("Unexpected API response format:", attendedExamsData);
          return;
        }
  
        const combinedData = await Promise.all(
          attendedExamsData.results.map(async (exam) => {
            const quizDetailsResponse = await fetch(
              // `http://localhost:3001/api/students/exam/${exam.quiz}`
               `${API}/api/students/exam/${exam.quiz}`
              ,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
  
            if (!quizDetailsResponse.ok) {
              throw new Error(`Quiz API Error: ${quizDetailsResponse.status} ${quizDetailsResponse.statusText}`);
            }
  
            const quizDetails = await quizDetailsResponse.json();
            return {
              attended_exam: exam,
              quiz_details: quizDetails,
            };
          })
        );
        const currentTime = new Date();
        const filteredExams = combinedData.filter(exam => 
          new Date(exam.quiz_details.schedule_time_range.end) < currentTime
        );
      
        setAttendedExams(filteredExams);
  
        console.log("Combined data is:", filteredExams);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      }
    };
  
    fetchData();
  }, []);

const generateExamPDF = (exam) => {
  const { quiz_details, attended_exam } = exam;

  if (!quiz_details || !attended_exam) {
    alert("Exam details are missing.");
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const rollNumberRange =
    quiz_details.start_roll_number && quiz_details.end_roll_number
      ? `${quiz_details.start_roll_number}-${quiz_details.end_roll_number}`
      : "Not Specified";

  const attemptedSetNumber = Object.entries(quiz_details.assigned_sets)
    .find(([roll, set]) => set === attended_exam.responses[0].set_number)?.[1];

  const attemptedSet = quiz_details.sets.find(set => set.set_number === attemptedSetNumber);

  if (!attemptedSet) {
    doc.text("Error: No questions found for your set.", 10, 60);
    return;
  }

  doc.setFontSize(80);
  doc.setTextColor(220, 220, 220);
  doc.setFont('helvetica', 'bold');
  doc.text("PREVIEW", 105, 150, { align: 'center', angle: -45 });

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text("Exam Results", 105, 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(20, 30, 190, 30);

  doc.setFontSize(12);
  
  const addInfoLine = (label, value, yPos) => {
    const labelStr = String(label);
    const valueStr = String(value || ''); 
    
    doc.setFont('helvetica', 'bold');
    doc.text(labelStr, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(valueStr, 97, yPos); 
  };

  let yPos = 40;
  addInfoLine("Exam Name:", quiz_details.exam_name, yPos);
  yPos += 8;
  addInfoLine("Schedule Date:", new Date(quiz_details.schedule_date).toLocaleDateString(), yPos);
  yPos += 8;
  addInfoLine("Branch:", quiz_details.branch, yPos);
  yPos += 8;
  addInfoLine("Batch:", quiz_details.batch, yPos);
  yPos += 8;
  addInfoLine("Roll Number Range:", rollNumberRange, yPos);
  yPos += 8;
  addInfoLine("Set:", attemptedSetNumber, yPos);

  const tableRows = attemptedSet.questions.map((q, index) => {
    const response = attended_exam.responses.find((res) => res.question_id === q._id);
    const selectedAnswer = response ? String(q.options[response.selected_option] || 'Not answered') : "Not answered";
    let isCorrect;
    if (response) {
      isCorrect = response.is_correct ? "R" : "W"; 
    } else {
      isCorrect = "W";
    }
    const correctAnswer = response && !response.is_correct ? String(q.options[q.correct_option] || '-') : "-"; 

    return [
      String(index + 1), 
      `set ${String(attemptedSetNumber)} set ${String(attemptedSetNumber)} ${String(q.question_text)}`, 
      q.options.map(opt => String(opt)).join(", "), 
      selectedAnswer, 
      isCorrect, 
      correctAnswer, 
      String(q.marks), 
    ];
  });

  doc.autoTable({
    head: [["#", "Question", "Options", "Your Answer", "Correct?", "Correct Answer", "Marks"]],
    body: tableRows,
    startY: yPos + 10,
    styles: { 
      fontSize: 10, 
      cellPadding: 3,
      lineColor: [220, 220, 220],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [242, 242, 242],
      textColor: [51, 51, 51],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249]
    },
    columnStyles: {
      0: { cellWidth: 10 }, 
      1: { cellWidth: 60 }, 
      2: { cellWidth: 40 }, 
      3: { cellWidth: 25 }, 
      4: { cellWidth: 15, halign: "center" },
      5: { cellWidth: 25 }, 
      6: { cellWidth: 15, halign: "center" }, 
    }
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 270, 210, 30, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(153, 153, 153);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 285);
    
    doc.text(`Page ${i} of ${pageCount}`, 170, 285);
  }

  doc.save(`${quiz_details.exam_name}_Set_${attemptedSetNumber}_Results.pdf`);
};

  const openModal = (exam, type) => {
    setSelectedExam(exam);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedExam(null);
    setModalType(null);
  };

  const renderModalContent = () => {
    if (!selectedExam) return null;

    switch(modalType) {
   
      case 'details':
        return (
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold">{selectedExam.name} Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-600">Marks</p>
                <p className="text-blue-600 font-bold">{selectedExam.marks}/{selectedExam.totalMarks}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Percentile</p>
                <p className="text-green-600 font-bold">{selectedExam.percentile}%</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Class Average</p>
                <p>{selectedExam.performance.classAverage}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Difficulty</p>
                <p>{selectedExam.performance.difficulty}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Your Rank</p>
                <p>{selectedExam.performance.yourRank}/{selectedExam.performance.totalStudents}</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        student={{ name: 'John Smith' }} // Example student data
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
        <div className="mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Exam Performance Analytics</h1>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <table className="w-full">
            
              <thead className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                <tr>
                  <th className="p-3 text-left">Exam</th>
                  <th className="p-3 text-center">Date</th>
                  <th className="p-3 text-center">Performance</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendedExams.map((exam) => (
                  <tr key={exam.attended_exam._id} className="border-b hover:bg-indigo-50">
                    <td className="p-3">
                      <div className="font-semibold">{exam.quiz_details.exam_name}</div>
                      {/* <div className="text-sm text-gray-500">{exam.teacherName || "N/A"}</div> */}
                    </td>
                    <td className="p-3 text-center">{new Date(exam.quiz_details.schedule_date).toLocaleDateString()}</td>
                    <td className="p-3 text-center">
                      <div className="font-bold text-blue-600">{exam.attended_exam.score} / {exam.attended_exam.total_marks} </div>
                      {/* <div className="text-sm text-green-600">{exam.percentile}%</div> */}
                    </td>
                    <td className="p-3 text-center flex justify-center space-x-2">
                      {/* <button 
                        onClick={() => openModal(exam, 'details')}
                        className="text-green-500 hover:text-green-700"
                        title="Exam Details"
                      >
                        <BarChart size={20} />
                      </button> */}
                      <button 
                        onClick={() => generateExamPDF(exam)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Download PDF"
                      >
                        <Download size={20} />
                      </button>
                      
                      {/* <button 
                        onClick={() => navigate(`/student/leaderboard/${exam.attended_exam.quiz}`)}
                        className="text-yellow-500 hover:text-yellow-700"
                        title="Leaderboard"
                      > */}
                      <button 
                          onClick={() => {
                            console.log("Navigating with quiz ID:", exam.attended_exam.quiz);
                            console.log("Full exam.attended_exam:", exam.attended_exam);
                            navigate(`/student/leaderboard/${exam.attended_exam.quiz}`);
                          }}
                          className="text-yellow-500 hover:text-yellow-700"
                          title="Leaderboard"
                        >
                        {/* <Trophy size={20} /> */}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Overlay */}
        {selectedExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto relative">
              <button 
                onClick={closeModal} 
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
              {renderModalContent()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExamPerformance;
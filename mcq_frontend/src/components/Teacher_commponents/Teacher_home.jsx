

import React, { useState, useEffect } from "react";
import TeacherNavbar from "./TeacherNavbar";
import TeacherSidebar from "./TeacherSidebar";
import { jsPDF } from "jspdf";
import QuizScheduleModal from "./QuizScheduleModal"; 

import { Download, Trash2, Book ,PieChart ,SquarePen  } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import GoogleStyleInsights from "./chart";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import QuizScheduleUpdate from "./QuizScheduleModal";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { Toaster } from "../../utils/Toaster";
const API = import.meta.env.VITE_BACKEND_API_URL;

const TeacherHome = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeContent, setActiveContent] = useState("dashboard");
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 
  const [showUpdateModal, setShowUpdateModal] = useState(false);
const [selectedQuizId, setSelectedQuizId] = useState(null);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [quizToDelete, setQuizToDelete] = useState(null);


  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          // "http://localhost:3001/api/quiz/my-quizzes"
          `${API}/api/quiz/my-quizzes`

          , {
          headers: { Authorization: `Bearer ${token}` },
        });
      
        const mappedQuizzes = response.data.map((q) => {
          let totalStudents = 0;
          if (q.roll_number_range) {
            const parts = q.roll_number_range.split("-");
            if (parts.length === 2) {
              const start = parseInt(parts[0].trim(), 10);
              const end = parseInt(parts[1].trim(), 10);
              totalStudents = end - start + 1;
            }
          }
          // Extract date (YYYY-MM-DD)
          const date = q.schedule_date ? q.schedule_date.split("T")[0] : "";
          // Format the start and end time from schedule_time_range
          const startTime = q.schedule_time_range && q.schedule_time_range.start
            ? new Date(q.schedule_time_range.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : "";
          const endTime = q.schedule_time_range && q.schedule_time_range.end
            ? new Date(q.schedule_time_range.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : "";

          return {
            ...q,  // Spread the original quiz data
            id: q._id,
           
            name: q.exam_name ? q.exam_name.trim() : "Untitled Exam",
            date: q.schedule_date ? q.schedule_date.split("T")[0] : "",
            time: startTime,
            endTime: endTime,
            totalStudents: totalStudents,
            averageScore: 0,      
            highestScore: 0,      
            lowestScore: 0,       
            passRate: 0,          
            classSummary: { above90: 0, above80: 0, above70: 0, below70: 0 },
            topPerformers: []     
          };
        });
        setQuizzes(mappedQuizzes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDownloadReport = async (quizId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        // `http://localhost:3001/api/leaderboard/getall/${quizId}`
        `${API}/api/leaderboard/getall/${quizId}`
        
        ,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Quiz System';
      workbook.created = new Date();

      response.data.leaderboards.forEach((leaderboard) => {
        const worksheet = workbook.addWorksheet(`Set ${leaderboard.setNumber}`);
        
        worksheet.columns = [
          { header: 'Rank', key: 'rank', width: 10 },
          { header: 'Roll Number', key: 'rollNo', width: 20 },
          { header: 'Marks', key: 'marks', width: 10 }
        ];

        const sortedStudents = [...leaderboard.rankings].sort((a, b) => b.score - a.score);

        sortedStudents.forEach((student, index) => {
          let rank = index + 1;
          
          if (index > 0 && sortedStudents[index - 1].score === student.score) {
            rank = worksheet.getRow(index).getCell('rank').value;
          }

          worksheet.addRow({
            rank: rank,
            rollNo: student.rollNo,
            marks: student.score
          });
        });

        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
          };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      saveAs(blob, `quiz_report_${quizId}.xlsx`);
      
    } catch (error) {
      console.error('Download error:', error);
      Toaster.error('Failed to download report. Please try again.');
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        // `http://localhost:3001/api/quiz/deletequiz/${quizToDelete}`
        `${API}/api/quiz/deletequiz/${quizToDelete}`
        
        ,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setQuizzes(prev => prev.filter(q => q.id !== quizToDelete));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Delete error:", error);
      Toaster.error("Failed to delete quiz. Please try again.");
    }
  };


  const openModal = (quiz, type) => {
    if (type === "updatequiz") {
      setSelectedQuizId(quiz.id);
      setShowUpdateModal(true);
    }else if (type === "delete") {
      setQuizToDelete(quiz.id);
      setDeleteDialogOpen(true);
    } 
    else {
      setSelectedQuiz(quiz);
      setModalType(type);
    }
  };

  const closeModal = () => {
    setSelectedQuiz(null);
    setModalType(null);
  };

  const generateQuizPDF = (quiz) => {
    if (!quiz) {
      Toaster.error("Quiz data is missing.");
      return;
    }
  
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  const formattedDate = new Date(quiz.schedule_date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
    // Add watermark
    doc.setFontSize(80);
    doc.setTextColor(220, 220, 220);
    doc.setFont('helvetica', 'bold');
    doc.text("QUESTION PAPER", 105, 150, { align: 'center', angle: -45 });
  
    // Reset styling
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
  
    // Add header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("Exam Question Paper", 105, 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  
    // Add divider line
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 25, 190, 25);
  
    // Exam details
    let yPos = 35;
    const addDetail = (label, value) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 60, yPos);
      yPos += 7;
    };
  
    
    // In your addDetail calls:
  addDetail("Exam Name", quiz.exam_name);
  addDetail("Date", formattedDate);
  addDetail("Branch", quiz.branch);
  addDetail("Batch", quiz.batch.toString());
  addDetail("Roll Numbers", quiz.roll_number_range);
  addDetail("Total Sets", quiz.total_sets.toString())
    // Create a page for each set
    quiz.sets.forEach((set, index) => {
      if (index > 0) doc.addPage(); // New page for each set
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(`Set ${set.set_number}`, 20, yPos + 10);
      doc.setFontSize(12);
  
      const questions = set.questions.map((q, qIndex) => [
        (qIndex + 1).toString(),
        q.question_text,
        q.options.join('\n'),
        q.options[q.correct_option],
        q.marks.toString()
      ]);
  
      doc.autoTable({
        head: [['#', 'Question', 'Options', 'Correct Answer', 'Marks']],
        body: questions,
        startY: yPos + 20,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 70 },
          2: { cellWidth: 60 },
          3: { cellWidth: 30 },
          4: { cellWidth: 15 }
        },
        headStyles: { fillColor: [220, 220, 220] }
      });
  
      // Reset Y position for next set
      yPos = 30;
    });
  
    // Add footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Generated ${new Date().toLocaleDateString()}`, 20, 285);
      doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
    }
  
    doc.save(`${quiz.exam_name}_Question_Sets.pdf`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {/* Navbar & Sidebar */}
      <TeacherNavbar
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        teacher={{ name: "John Smith" }}
        isLoggedIn={true}
        userType="teacher"
        onLogout={onLogout}
      />
      <TeacherSidebar
        isSidebarOpen={isSidebarOpen}
        activeContent={activeContent}
        setActiveContent={setActiveContent}
      />
{showUpdateModal && (
  <QuizScheduleModal 
    onClose={() => setShowUpdateModal(false)} 
    quizId={selectedQuizId} 
  />
)}
{deleteDialogOpen && (
        <DeleteConfirmationDialog 
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteQuiz}
        />
      )}
      <main
        className={`absolute transition-all duration-200 ${
          isSidebarOpen ? "left-60" : "left-16"
        } right-0 top-20 bottom-0 px-8`}
      >
        <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-8 text-white mb-1">
          <h1 className="text-3xl font-bold mb-0">Welcome back !👋</h1>
        </div>
        {/* Show Quiz Dashboard Only When Dashboard is Active */}
        {activeContent === "dashboard" && (
          <div className="min-h-screen bg-gray-50 p-2">
            <div className="p-6 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                  <tr>
                    <th className="p-3 text-left">Quiz Details</th>
                    <th className="p-3 text-center">Date & Time</th>
                    {/* <th className="p-3 text-center">Students</th>
                    <th className="p-3 text-center">Performance</th> */}
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr key={quiz.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-semibold">{quiz.name}</td>
                      <td className="p-3 text-center">
                        {quiz.date} <br />
                        <span className="text-sm text-gray-500">
                          {quiz.time} - {quiz.endTime}
                        </span>
                      </td>
                      {/* <td className="p-3 text-center">{quiz.totalStudents} students</td>
                      <td className="p-3 text-center font-bold text-blue-600">
                        {quiz.averageScore}%
                      </td> */}
                      <td className="p-3 text-center flex justify-center space-x-2">
                        <button
                          onClick={() => generateQuizPDF(quiz) }
                          className="text-blue-500 hover:text-blue-700"
                          title="Download MCQ Data"
                        >
                          <Book size={20} />
                        </button>
                        <button className="text-green-500 hover:text-green-700" onClick={() => handleDownloadReport(quiz.id)}
                         title="Download Report">
                          <Download size={20} />
                        </button>
                        {/* <button
                          onClick={() => openModal(quiz, "topPerformers")}
                          className="text-yellow-500 hover:text-yellow-700"
                          title="Top Performers"
                        >
                          <Trophy size={20} />
                        </button> */}
                        <button
                          onClick={() => openModal(quiz, "updatequiz")}
                          className="text-yellow-500 hover:text-yellow-700"
                          title="Update Quiz"
                        >
                          <SquarePen  size={20} />
                        </button>
                        
                        <button
                        onClick={() => openModal(quiz, "chart")}
                        className="text-pink-500 hover:text-pink-700"
                        title="Chart Insights"
                      >
                        <PieChart size={20} />
                      </button>
                      {/* <button
                        onClick={() => openModal(quiz, "delete")}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Quiz"
                      >
                        <Trash2 size={20} />
                      </button> */}
                      <button
                        onClick={() => openModal(quiz, "delete")}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Quiz"
                      >
                        <Trash2 size={20} />
                      </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal */}
            {selectedQuiz && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                {/* <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto relative"> */}
                <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
                  <button
                    onClick={closeModal}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                  {modalType === "performance" ? (
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-4">Class Performance Analysis</h2>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Average Score</p>
                            <p className="text-2xl font-bold text-blue-600">{selectedQuiz.averageScore}%</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Pass Rate</p>
                            <p className="text-2xl font-bold text-green-600">{selectedQuiz.passRate}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : modalType === "updatequiz" ? (
                   
                    <div className="p-6 w-full h-full">
                    <QuizScheduleUpdate quizId={selectedQuiz.id} />
                  </div>
                    
                  ): modalType === "chart" ? (
                    // <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
                    //   <GoogleStyleInsights />
                    // </div>
                    <div className="p-6 w-full h-full">
                      <GoogleStyleInsights quizId={selectedQuiz.id} />
                    </div>
                  ) :modalType === "delete" ? (
                    // <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
                    //   <GoogleStyleInsights />
                    // </div>
                    <div className="p-6 w-full h-full" onClick={() => setDialogOpen(true)}>
                      <DeleteConfirmationDialog      />
                    </div>
                  ): null}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherHome;
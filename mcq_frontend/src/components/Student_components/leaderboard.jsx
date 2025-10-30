



import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';
import StudentNavbar from './StudentNavbar';
import StudentSidebar from './StudentSidebar';
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_API_URL;


const ExamLeaderboard = ({onLogout}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  const { quizId } = useParams();

  useEffect(() => {
    if (!quizId) {
      setError("Quiz ID is missing");
      setLoading(false);
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        // const user = JSON.parse(localStorage.getItem('user'));
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("User not authenticated");
        }
        // const rollNo = user?.rollNo;

        const decodedPayload = JSON.parse(atob(token.split('.')[1]));
        const rollNo = decodedPayload.rollNo;
        console.log("[DEBUG] API Parameters:", { quizId, rollNo });

        if (!rollNo) {
          throw new Error("Student roll number not found");
        }

        const response = await axios.get(
          // `http://localhost:3001/api/leaderboard/getleaderboard/${quizId}?rollNo=${rollNo}`
          `${API}/api/leaderboard/getleaderboard/${quizId}?rollNo=${rollNo}`

        );

        console.log("[DEBUG] Full API Response:", response.data);
        console.log("[DEBUG] Leaderboard Data:", response.data.leaderboard?.rankings);


        if (!response.data.leaderboard?.rankings) {
          setExam({
            name: response.data.quizData?.exam_name ||'Exam Results',
            leaderboard: [],
            totalMarks: 0,
            setNumber: response.data.leaderboard?.setNumber || 0
          });
          return;
        }
        console.log("here is : ",response.data.quizData.exam_name);

        const apiRankings = response.data.leaderboard.rankings.map((item, index) => ({
          rank: index + 1,
          name: item.student?.name || item.rollNo,
          marks: item.score,
          rollNo: item.rollNo
        }));

        setExam({
          name: response.data.quizData?.exam_name || 'Exam Results',
          // date: new Date(response.data.leaderboard.schedule_date).toLocaleDateString(),
          date: new Date(response.data.leaderboard.updated_at).toLocaleDateString(),

          totalMarks: response.data.leaderboard.total_marks || 0,
          setNumber: response.data.leaderboard.setNumber,
          leaderboard: apiRankings
        });

      } catch (err) {
        // setError(err.response?.data?.message || err.message);
        console.error("[ERROR] API Failure:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message});
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [quizId]);

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          student={{ name: 'John Smith' }}
          isLoggedIn={true}
          userType="student"
        />
        <div className="text-center text-red-500 text-xl mt-10">
          {loading ? 'Loading...' : error ? `Error: ${error}` : 'Exam not found!'}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(exam.leaderboard.length / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = exam.leaderboard.slice(indexOfFirstStudent, indexOfLastStudent);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        student={{ name: 'John Smith' }}
        isLoggedIn={true}
        userType="student"
        onLogout={onLogout}
      />
      <StudentSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        activeMenu="leaderboard"
      />

      <main
        className={`absolute transition-all duration-200 ${
          isSidebarOpen ? "left-60" : "left-16"
        } right-0 top-20 bottom-0 px-8`}
      >
        <div className="w-full max-w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 text-white p-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold">{exam.name}</h1>
              <p className="text-sm opacity-80 mt-1">
                {exam.date} {exam.setNumber ? `| Set ${exam.setNumber}` : ''}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Award size={40} className="text-yellow-300" />
              <div className="text-right">
                {/* <p className="font-semibold text-lg">Total Marks</p>
                <p className="text-2xl font-bold">{exam.totalMarks}</p> */}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="p-6">
            {exam.leaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No submissions yet for your set
              </div>
            ) : (
              <>
                <div className="grid grid-cols-12 bg-gray-100 rounded-lg p-3 font-semibold text-gray-600 mb-2">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-6">Student Name</div>
                  <div className="col-span-4 text-right">Marks</div>
                </div>

                {currentStudents.map((student, index) => (
                  <div
                    key={`${student.rollNo}-${index}`}
                    className={`grid grid-cols-12 items-center p-3 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-indigo-50 transition-colors rounded-lg mb-2`}
                  >
                    <div className="col-span-2 font-bold text-gray-700">{student.rank}</div>
                    <div className="col-span-6 font-medium">{student.name}</div>
                    <div className="col-span-4 text-right font-semibold text-indigo-600">
                      {student.marks}
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6">
                  <div className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 bg-indigo-100 text-indigo-600 rounded-full disabled:opacity-50"
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-indigo-100 text-indigo-600 rounded-full disabled:opacity-50"
                    >
                      <ChevronRight />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamLeaderboard;


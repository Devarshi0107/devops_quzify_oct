

import React, { useState, useEffect ,useRef,useMemo } from "react";
import { useNavigate ,useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { Clock, ChevronRight, Flag, Trash2, CheckCircle } from "lucide-react";
import StudentSidebar from "./StudentSidebar";
import StudentNavbar from "./StudentNavbar";
import seedrandom from 'seedrandom';
import { Toaster } from "../../utils/Toaster";
const API = import.meta.env.VITE_BACKEND_API_URL;


function shuffle(array, rng) {
  const newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}


const StudentMyExam_questions = ({onLogout}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
    const [currentQuestion, setCurrentQuestion] = useState(0);
     const [answers, setAnswers] = useState({});
    const [reviewedQuestions, setReviewedQuestions] = useState(new Set());
    const [isExamStarted, setIsExamStarted] = useState(false); 
    const [timeLeft, setTimeLeft] = useState(0); 
    const navigate = useNavigate();
    const location = useLocation();
    const examData = location.state?.examData || { questions: [] };
    const [student, setStudent] = useState(null);
    // const totalQuestions = currentSet.questions.length;
    const [token, setToken] = useState("");
    const intervalRef = useRef(null); 
    const [isExamSubmitted, setIsExamSubmitted] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState('');
    const assignedSet = location.state?.examData?.assigned_set || 1;
    const currentSet = location.state?.examData?.sets?.find(set => set.set_number === assignedSet) 
    const totalQuestions = currentSet?.questions?.length || 0;
    
    const QUESTIONS_PER_PAGE = 30;
const [navigatorPage, setNavigatorPage] = useState(0); 
const startIdx = navigatorPage * QUESTIONS_PER_PAGE;
const endIdx = Math.min(startIdx + QUESTIONS_PER_PAGE, totalQuestions);
const currentNavigatorSet = [...Array(totalQuestions).keys()].slice(startIdx, endIdx);
   

   
  const shuffledQuestions = useMemo(() => {
    if (!student || !examData || !currentSet) return [];
    const seed = `${student.id}-${examData._id}`;
    const rng = seedrandom(seed);
    return shuffle(currentSet.questions.slice(), rng).map(question => {
      const optionSeed = `${seed}-${question._id}`;
      const optionRng = seedrandom(optionSeed);
      const indices = [...Array(question.options.length).keys()];
      const shuffledIndices = shuffle(indices, optionRng);
      const shuffledOptions = shuffledIndices.map(i => question.options[i]);
      return {
        ...question,
        shuffledOptions,
        optionMapping: shuffledIndices, 
      };
    });
  }, [student, examData, currentSet]);


    useEffect(() => {
    const autoSave = async () => {
      if (!student || !examData?._id) return;
      const responses = shuffledQuestions.map((question, index) => ({
        question_id: question._id,
        selected_option: answers[index] !== undefined ? answers[index] : null,
        status: reviewedQuestions.has(index) ? "flagged" : (answers[index] !== undefined ? "answered" : "not-visited"),
      }));

      try {
        const response = await fetch(
          // "http://localhost:3001/api/student-quiz/autosave-exam"
          `${API}/api/student-quiz/autosave-exam`

          , {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            student: student.id,
            quiz: examData._id,
            responses,
          }),
        });

        if (!response.ok) throw new Error("Auto-save failed");
        const data = await response.json();
        console.log("Auto-save successful:", data);
      } catch (error) {
        if (error.name === 'VersionError') {
      console.log('Version conflict detected, retrying...');
      
      const latestData = await fetchLatestExamData(examId);
     
      const updatedData = { ...latestData, responses: examData.responses };
     
      await autoSave(updatedData);
    } else {
      console.error('Auto-save error:', error);
    }
      }
    };

    const autoSaveInterval = setInterval(() => {
    if (timeLeft > 5) autoSave(); 
  }, 10000);
    return () => clearInterval(autoSaveInterval);
  }, [student, examData, answers, reviewedQuestions, shuffledQuestions]);

 
  const handleSubmitExam = async () => {
    if (!student || !examData?._id) return;
    const responses = shuffledQuestions.map((question, index) => ({
      question_id: question._id,
      selected_option: answers[index] !== undefined ? answers[index] : null,
      status: reviewedQuestions.has(index) ? "flagged" : (answers[index] !== undefined ? "answered" : "not-visited"),
    }));

    try {
      const response = await fetch(
        // "http://localhost:3001/api/student-quiz/submit-exam"
        `${API}/api/student-quiz/submit-exam`
        , {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          student: student.id,
          quiz: examData._id,
          responses,
        }),
      });

      if (!response.ok) throw new Error("Exam submission failed");
      const data = await response.json();
      console.log("Exam submitted successfully:", data);
      Toaster.success("Exam submitted successfully");
      setIsExamSubmitted(true);
      setSubmissionMessage("This exam is already submitted.");
      localStorage.removeItem("examResponses");
      localStorage.removeItem("reviewedQuestions");
      // Toaster.success("Exam submitted successfully");
      navigate('/student_dashboard');
    } catch (error) {
      // console.error("Exam submission error:", error);
      // alert("Failed to submit exam. Please try again.");
      if (error.name === 'VersionError') {
      console.log('Version conflict detected, retrying...');
      const latestData = await fetchLatestExamData(examId);
      const updatedData = { ...latestData, responses: examData.responses };
      await handleSubmitExam(updatedData);
    } else {
      console.error('Exam submission error:', error);
      // alert('Failed to submit exam. Please try again.');
      Toaster.error("Failed to submit exam. Please try again.");
    }
    }
  };

  
  const handleAnswer = (shuffledIdx) => {
    const question = shuffledQuestions[currentQuestion];
    const originalIdx = question.optionMapping[shuffledIdx];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: originalIdx,
    }));
  };
    useEffect(() => {
      if (timeLeft === 0) {
        console.log("Time's up! Auto-submitting exam...");
        handleSubmitExam();
      }
    }, [timeLeft]);
    useEffect(() => {
      localStorage.setItem("examResponses", JSON.stringify(answers));
      localStorage.setItem("reviewedQuestions", JSON.stringify([...reviewedQuestions]));
    }, [answers, reviewedQuestions]);

    useEffect(() => {
      const savedAnswers = JSON.parse(localStorage.getItem("examResponses")) || {};
      const savedReviewedQuestions = new Set(JSON.parse(localStorage.getItem("reviewedQuestions")) || new Set());
    
      setAnswers(savedAnswers);
      setReviewedQuestions(savedReviewedQuestions);
    }, []);
    useEffect(() => {
        console.log("Questions Array (on mount):", currentSet.questions);
        console.log("Total Questions (on mount):", totalQuestions);
      }, []); 
    useEffect(() => {
        if (!examData?.schedule_time_range?.end) return;
      
        const endTime = new Date(examData.schedule_time_range.end).getTime();
      
        const updateCountdown = () => {
          const now = new Date().getTime();
          const timeRemaining = endTime - now;
      
          if (timeRemaining <= 0) {
            setTimeLeft(0);
            clearInterval(intervalRef.current);
          } else {
            setTimeLeft(timeRemaining);
          }
        };
      
        updateCountdown(); 
      
        if (intervalRef.current) clearInterval(intervalRef.current); // 
        intervalRef.current = setInterval(updateCountdown, 1000);
      
        return () => clearInterval(intervalRef.current);
      }, [examData?.schedule_time_range?.end]); 

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
  
    useEffect(() => {
      if (!isExamStarted) return;
  
      
      const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(intervalId); 
            return 0;
          }
          return prevTime - 1; 
        });
      }, 1000);
  
   
      return () => clearInterval(intervalId);
    }, [isExamStarted]);
  
  
  
    const markForReview = () => {
      setReviewedQuestions((prev) => new Set(prev).add(currentQuestion));
    };
  
    const clearResponse = () => {
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[currentQuestion];
        return newAnswers;
      });
      setReviewedQuestions((prev) => {
        const newReviewed = new Set(prev);
        newReviewed.delete(currentQuestion);
        return newReviewed;
      });
    };
  
    const getQuestionStatus = (index) => {
      if (reviewedQuestions.has(index)) return "bg-yellow-100 border-yellow-400 text-yellow-700";
      if (answers[index] !== undefined) return "bg-emerald-100 border-emerald-400 text-emerald-700";
      return "bg-white border-gray-200 text-gray-600";
    };
  
    const startExam = () => {
      setIsExamStarted(true);
    };
  
   
    
    const formatTime = (milliseconds) => {
        const seconds = Math.floor((milliseconds / 1000) % 60);
        const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
        const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
        const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
      
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      };
  
  

      useEffect(() => {
        const checkExamSubmission = async () => {
            const token = localStorage.getItem("token");
            if (!token || !examData?._id) return;
    
            try {
                const decodedToken = JSON.parse(atob(token.split(".")[1]));
                const studentId = decodedToken.id;
                
                const response = await fetch(
                    // `http://localhost:3001/api/student-quiz/check-submission?student=${studentId}&quiz=${examData._id}`
                    `${API}/api/student-quiz/check-submission?student=${studentId}&quiz=${examData._id}`
                    
                    ,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
    
                if (!response.ok) {
                    throw new Error("Failed to check submission status");
                }
    
                const data = await response.json();
                if (data.submitted) {
                    setIsExamSubmitted(true); 
                    setSubmissionMessage(data.message); 
                }
            } catch (error) {
                console.error("Error checking submission status:", error);
                setSubmissionMessage("Error checking submission status. Please try again.");
            }
        };
    
        checkExamSubmission();
    }, [examData]);


  const fetchLastAttempt = async () => {
    const token = localStorage.getItem("token");
    if (!token || !examData?._id) return;

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const studentId = decodedToken.id;
      const response = await fetch(
        // `http://localhost:3001/api/student-quiz/getlast-attempts?student=${studentId}&quiz=${examData._id}`
        `${API}/api/student-quiz/getlast-attempts?student=${studentId}&quiz=${examData._id}`
        
        , {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch last attempt");
      const data = await response.json();
      if (data.message === "Attempt found") {
        const attemptData = data.attempt.responses;
        const restoredAnswers = {};
        const restoredReviewedQuestions = new Set();

        shuffledQuestions.forEach((question, index) => {
          const response = attemptData.find(r => r.question_id === question._id);
          if (response) {
            if (response.selected_option !== null) {
              restoredAnswers[index] = response.selected_option;
            }
            if (response.status === "flagged") {
              restoredReviewedQuestions.add(index);
            }
          }
        });

        setAnswers(restoredAnswers);
        setReviewedQuestions(restoredReviewedQuestions);
      }
    } catch (error) {
      console.error("Error fetching last attempt:", error);
    }
  };

  useEffect(() => {
    fetchLastAttempt();
  }, [examData, shuffledQuestions]);
  
    if (isExamSubmitted) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Exam Already Submitted</h1>
            <p className="text-gray-600 mt-2">{submissionMessage}</p>
            <button
              onClick={() => navigate('/student_dashboard')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

   
const getDifficultyBadgeStyle = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
    return (
  <div className="min-h-screen ">
    {/* Navbar */}
    <StudentNavbar
      toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      student={student ? { name: ` ${student.rollNo}` } : { name: "Guest" }} 
      isLoggedIn={true}
      userType="student"
      onLogout={onLogout}
    />

    {/* Sidebar */}
    <StudentSidebar
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
    />

    {/* Main Content */}
    <main
      className={`absolute transition-all duration-200 ${isSidebarOpen ? "pl-3 left-60" : "pl-3 left-16"} right-0 top-16 bottom-0`}
    >
      <div className="bg-gradient-to-br from-orange-500 to-pink-500 text-white p-4">
        <div className="max-w-7xl mx-10 flex justify-between items-center">
          <h1 className="text-xl font-medium">Exam: {examData?.exam_name || "Loading..."}</h1>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
            <button
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium"
              onClick={handleSubmitExam}
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* Question and Navigation Area */}
     
         {/* Question and Navigation Area */}
        <div className="max-w-7xl mx-auto p-6 px-8 relative z-10">
          <div className="flex gap-6">
            {/* ─── LEFT: Question Area */}
            <div className="w-[70%] space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Question Header */}
                <div className="flex justify-between mb-4">
                  <span className="text-indigo-600">Question {currentQuestion + 1}</span>
                  <span className="text-gray-600">Marks: {shuffledQuestions[currentQuestion]?.marks}</span>
                </div>
                <span className={`inline-block px-2 py-1 rounded ${getDifficultyBadgeStyle(shuffledQuestions[currentQuestion]?.difficulty)}`}>
                  {shuffledQuestions[currentQuestion]?.difficulty}
                </span>
                <h2 className="text-xl mt-2">{shuffledQuestions[currentQuestion]?.question_text}</h2>

                {/* Options */}
                <div className="mt-6 space-y-4">
                  {shuffledQuestions[currentQuestion]?.shuffledOptions.map((opt, i) => {
                    const orig = shuffledQuestions[currentQuestion].optionMapping[i];
                    const sel = answers[currentQuestion] === orig;
                    return (
                      <div
                        key={i}
                        onClick={() => handleAnswer(i)}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                          sel
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${sel ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300"}`}>
                          {sel && <CheckCircle className="w-4 h-4" />}
                        </div>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex justify-between bg-gray-50 p-4 rounded-b-lg">
                  <div className="flex gap-3">
                    <button onClick={markForReview} className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 flex items-center gap-2">
                      <Flag className="w-4 h-4" /> Flag
                    </button>
                    <button onClick={clearResponse} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Clear
                    </button>
                  </div>
                  <button onClick={() => setCurrentQuestion(q => Math.min(q + 1, totalQuestions - 1))}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    Save & Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ─── RIGHT: Question Navigator */}
            <div className="w-[30%]">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Question Navigator</h3>

                {/* Grid of 30 buttons */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {currentNavigatorSet.map(idx => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`h-10 border-2 rounded-lg font-medium transition-all
                        ${getQuestionStatus(idx)}
                        ${currentQuestion === idx ? "ring-2 ring-indigo-600 ring-offset-2" : ""}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {/* Prev / Next page controls */}
                <div className="flex justify-between items-center">
                  <button
                    disabled={navigatorPage === 0}
                    onClick={() => setNavigatorPage(p => p - 1)}
                    className="px-4 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {navigatorPage + 1} of {Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)}
                  </span>

                  <button
                    disabled={endIdx >= totalQuestions}
                    onClick={() => setNavigatorPage(p => p + 1)}
                    className="px-4 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                {/* Legend */}
                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-emerald-100 border-2 border-emerald-400 rounded"></span>
                    Answered: {Object.keys(answers).length}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></span>
                    Flagged: {reviewedQuestions.size}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-white border-2 border-gray-200 rounded"></span>
                    Not Visited: {totalQuestions - Object.keys(answers).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
    </main>
  </div>
)};

export default StudentMyExam_questions;



import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import TeacherNavbar from "./TeacherNavbar";
import TeacherSidebar from "./TeacherSidebar";
import moment from 'moment-timezone';
import { Toaster } from '../../utils/Toaster';
const API = import.meta.env.VITE_BACKEND_API_URL;


const MCQGenerator = ({onLogout}) => {
  const [totalMarks, setTotalMarks] = useState('');
  const [easyQuestions, setEasyQuestions] = useState('');
  const [mediumQuestions, setMediumQuestions] = useState('');
  const [hardQuestions, setHardQuestions] = useState('');
  const [negativeMarks, setNegativeMarks] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedSets, setSelectedSets] = useState([]); 
  const [filenames, setFilenames] = useState([]);
  const [displayedQuestions, setDisplayedQuestions] = useState([]);
  const [examName, setExamName] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [branch, setBranch] = useState('');
  const [batch, setBatch] = useState('');
  const [startRollNumber, setStartRollNumber] = useState('');
  const [endRollNumber, setEndRollNumber] = useState('');
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [numSets, setNumSets] = useState(1); 
  const [activeContent, setActiveContent] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentSet, setCurrentSet] = useState(null);
  const today = new Date().toISOString().split('T')[0];


  const branchBatchMapping = {
    IT: ['2022', '2023', '2024'],
    CS: ['22CS', '23CS', '24CS'],
    CE: ['22CE', '23CE', '24CE'],
  };

  useEffect(() => {
    if (branch) {
      setFilteredBatches(branchBatchMapping[branch] || []);
    } else {
      setFilteredBatches([]);
    }
  }, [branch]);

  useEffect(() => {
   
    const marksPerEasyQuestion = 1; 
    const marksPerMediumQuestion = 2; 
    const marksPerHardQuestion = 3; 
  

    const total =
      parseInt(easyQuestions || 0) * marksPerEasyQuestion +
      parseInt(mediumQuestions || 0) * marksPerMediumQuestion +
      parseInt(hardQuestions || 0) * marksPerHardQuestion;
  
    setTotalMarks(total);
  }, [easyQuestions, mediumQuestions, hardQuestions]);
 
  const generateExcel = () => {
    if (selectedSets.length === 0) {
      Toaster.error("No sets to generate Excel file.");
      return;
    }
  
    const workbook = XLSX.utils.book_new();
  
    selectedSets.forEach((set) => {
      const rows = set.questions.map((q, index) => [
        index + 1, 
        q.question, 
        q.options.join(", "),
        q.correct_answer, 
        q.difficulty, 
        q.marks, 
      ]);
  
      const header = ["#", "Question", "Options", "Answer", "Difficulty", "Marks"];
      rows.unshift(header);
  
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
  
      XLSX.utils.book_append_sheet(workbook, worksheet, `Set ${set.id}`);
    });
  
    XLSX.writeFile(workbook, `${examName}_MCQs.xlsx`);
  };


  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFilenames(files.map(file => file.name));
    setQuestions([]);
  
    const allQuestions = [];
  
    files.forEach((file) => {
      const reader = new FileReader();
      const fileType = file.type;
  
      reader.onload = (e) => {
        try {
          if (fileType === 'application/json') {
            const json = JSON.parse(e.target.result);
            if (json.questions && Array.isArray(json.questions)) {
              json.questions.forEach(q => {
                if (q.question_text && q.options && typeof q.correct_option === 'number') {
                  allQuestions.push({
                    question: q.question_text,
                    options: q.options,
                    correct_answer: q.options[q.correct_option],
                    difficulty: q.difficulty,
                    marks: q.marks
                  });
                }
              });
            }
          } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
  
            const formattedQuestions = json.map((row) => {
              // Handle different column name variations
              const questionText = row['question_text'] || row['question'];
              const options = (row.options || '').split(/\s*,\s*/);
              const correctAnswer = options[row.correct_option];
  
              return {
                question: questionText,
                options: options,
                correct_answer: correctAnswer,
                difficulty: row.difficulty,
                marks: row.marks
              };
            }).filter(q => 
              q.question && 
              q.options.length >= 2 &&
              q.correct_answer &&
              q.difficulty &&
              q.marks
            );
  
            allQuestions.push(...formattedQuestions);
          }
        } catch (error) {
          console.error("Error reading file:", error);
          // alert(`Error processing ${file.name}: ${error.message}`);
          Toaster.error(`Error processing ${file.name}: ${error.message}`);
          return;
        }
  
        // Filter valid questions and update state
        const validQuestions = allQuestions.filter(q => 
          q.question?.trim() && 
          q.options?.length >= 2 &&
          q.options.includes(q.correct_answer) &&
          q.difficulty &&
          q.marks
        );
  
        setQuestions(prev => [...prev, ...validQuestions]);
      };
  
      if (fileType === 'application/json') {
        reader.readAsText(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        reader.readAsBinaryString(file);
      }
    });
  };

  const generateMCQs = () => {
    const easy = questions.filter(q => q.difficulty === 'easy');
    const medium = questions.filter(q => q.difficulty === 'medium');
    const hard = questions.filter(q => q.difficulty === 'hard');
  
    console.log("Easy Questions:", easy.length);
    console.log("Medium Questions:", medium.length);
    console.log("Hard Questions:", hard.length);
  
    const perSet = {
      easy: parseInt(easyQuestions),
      medium: parseInt(mediumQuestions),
      hard: parseInt(hardQuestions),
    };
  
    console.log("Questions per Set:", perSet);
    console.log("Number of Sets:", numSets);
  
    // Validate if enough questions are available
    if (
      easy.length < perSet.easy * numSets ||
      medium.length < perSet.medium * numSets ||
      hard.length < perSet.hard * numSets
    ) {
      // alert(`Not enough questions to generate ${numSets} sets.`);
      Toaster.error(`Not enough questions to generate ${numSets} sets.`);
      return;
    }
  
    // Track used questions to avoid duplication across sets
    const usedQuestions = new Set();
  
    // Generate sets
    const sets = [];
    for (let i = 0; i < numSets; i++) {
      const set = {
        id: i + 1,
        questions: [
          ...getRandomQuestions(easy, perSet.easy, usedQuestions),
          ...getRandomQuestions(medium, perSet.medium, usedQuestions),
          ...getRandomQuestions(hard, perSet.hard, usedQuestions),
        ],
      };
      sets.push(set);
    }
  
    setSelectedSets(sets);
    setDisplayedQuestions(sets.flatMap(set => set.questions));
  };

  
    const getRandomQuestions = (arr, count, usedQuestions) => {
    const availableQuestions = arr.filter(q => !usedQuestions.has(q.question.trim()));
    const shuffled = shuffle([...availableQuestions]);
    const selected = shuffled.slice(0, count);
  
    // Mark selected questions as used
    selected.forEach(q => usedQuestions.add(q.question.trim()));
  
    return selected;
  };
  
  // Shuffle array
  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };


  const createTest = async () => {
    if (selectedSets.length === 0) {
      // alert("No sets to save.");
      Toaster.error("No sets to save.");
      return;
    }
  
    // Validate required fields
    if (!examName || !scheduleDate || !startTime || !endTime || !branch || !batch) {
      // alert("Please fill all required fields");
      Toaster.error("Please fill all required fields");
      return;
    }
  
    // Generate roll prefix from selected batch
    const batchYear = String(batch);
    const batchShort = batchYear.slice(-2); // Get last 2 digits
    const rollPrefix = `${batchShort}${branch.toUpperCase()}`; // e.g., "22IT"
  
    // Pad roll numbers to 3 digits
    const startPadded = String(startRollNumber).padStart(3, '0');
    const endPadded = String(endRollNumber).padStart(3, '0');
    const rollNumberRange = `${rollPrefix}${startPadded}-${rollPrefix}${endPadded}`;
  
    // Format times with IST offset
    const startMoment = moment.tz(`${scheduleDate}T${startTime}`, "Asia/Kolkata");
    const endMoment = moment.tz(`${scheduleDate}T${endTime}`, "Asia/Kolkata");
  
    // Generate assigned sets
    const assignedSets = new Map();
    const totalStudents = endRollNumber - startRollNumber + 1;
    
    for (let i = 0; i < totalStudents; i++) {
      const currentNum = parseInt(startRollNumber) + i;
      const paddedNum = String(currentNum).padStart(3, '0');
      const rollNo = `${rollPrefix}${paddedNum}`;
      const setNumber = (i % numSets) + 1;
      assignedSets.set(rollNo, setNumber);
    }
  
  
  
    const sets = selectedSets.map(set => ({
      set_number: set.id,
      questions: set.questions.map(q => ({
        question_text: `Set ${set.id}: ${q.question} (Answer: ${q.correct_answer})`,
        options: q.options,
        correct_option: q.options.indexOf(q.correct_answer),
        marks: q.marks,
        difficulty: q.difficulty,
        negative_marks_per_question: negativeMarks || 0
      }))
    }));

    // Prepare payload
    const payload = {
      filename: `${examName.replace(/\s+/g, '_')}_${Date.now()}`,
      exam_name: examName,
      schedule_date: scheduleDate,
      schedule_time_range: {
        start: startMoment.format("YYYY-MM-DDTHH:mm:ss.SSS+05:30"),
        end: endMoment.format("YYYY-MM-DDTHH:mm:ss.SSS+05:30")
      },
      branch: branch.toUpperCase(),
      batch: parseInt(batch),
      roll_number_range: rollNumberRange,
      total_sets: numSets,
      negative_marks_per_question: Number(negativeMarks) || 0,
      sets,
      assigned_sets: Object.fromEntries(assignedSets),
      created_by: localStorage.getItem("teacherId")
    };
  
    console.log("Final Payload:", payload);
  
    try {
      const response = await fetch(
        // 'http://localhost:3001/api/quiz/save-quiz'
        `${API}/api/quiz/save-quiz`
        
        , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
  
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Backend Error:", responseData);
        throw new Error(responseData.error || "Failed to save quiz");
      }
  
      alert("Quiz saved successfully!");
      console.log("Saved Quiz:", responseData.quiz);
      
    } catch (error) {
      console.error("Error:", error);
      Toaster.error(`Error saving quiz: ${error.message}`);
      // alert(`Error saving quiz: ${error.message}`);
    }
  };

  const generatePDF = () => {
    if (!currentSet) {
      // alert("No set selected to generate PDF.");
      Toaster.error("No set selected to generate PDF.");
      return;
    }
  
    const doc = new jsPDF();
  
    // Add exam details
    doc.text(`Exam Name: ${examName}`, 10, 10);
    doc.text(`Schedule Date: ${scheduleDate}`, 10, 20);
    doc.text(`Branch: ${branch}`, 10, 30);
    doc.text(`Batch: ${batch}`, 10, 40);
    doc.text(`Roll Number Range: ${startRollNumber}-${endRollNumber}`, 10, 50);
  
    // Add set details
    doc.text(`Set ${currentSet.id}`, 10, 60);
  
   
  
    const rows = set.questions.map((q, index) => [
      index + 1,
      q.question_text || q.question, // Handle both formats
      q.options.join(", "),
      q.options[q.correct_option], // Show actual answer text
      q.difficulty,
      q.marks
    ]);
    // Add table to PDF
    doc.autoTable({
      head: [["#", "Question", "Options", "Answer", "Difficulty", "Marks"]],
      body: rows,
      startY: 70,
    });
  
    // Save PDF
    doc.save(`${examName}_Set_${currentSet.id}_MCQs.pdf`);
  };
  return (
    <div className="min-h-screen bg-gray-50 p-8">
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

      <main
        className={`absolute transition-all duration-200 ${
          isSidebarOpen ? "left-60" : "left-16"
        } right-0 top-20 bottom-0 px-8`}
      >
        <div className="max-w-8xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 flex justify-between items-center">
            <h1 className="text-4xl font-extrabold text-white">MCQ Generator</h1>
          </div>

          {/* Exam Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6">
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Exam Name</label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Schedule Date</label>
              <input
                type="date"
                min={today}
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Branch</option>
                <option value="IT">IT</option>
                <option value="CS">CS</option>
                <option value="CE">CE</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Batch</label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Batch</option>
                {filteredBatches.map((batchOption) => (
                  <option key={batchOption} value={batchOption}>
                    {batchOption}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">ID Range</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={startRollNumber}
                  onChange={(e) => setStartRollNumber(e.target.value)}
                  placeholder="Start"
                  className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="self-center">-</span>
                <input
                  type="text"
                  value={endRollNumber}
                  onChange={(e) => setEndRollNumber(e.target.value)}
                  placeholder="End"
                  className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-sm text-gray-500 pl-2">(Ex : 22IT001 - 050)</p>
            </div>
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Number of Sets</label>
              <input
                type="number"
                value={numSets}
                min="1"
                onChange={(e) => setNumSets(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Question Configuration */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Question Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">Easy Questions</label>
                <input
                  type="number"
                  value={easyQuestions}
                  onChange={(e) => setEasyQuestions(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">Medium Questions</label>
                <input
                  type="number"
                  value={mediumQuestions}
                  onChange={(e) => setMediumQuestions(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">Hard Questions</label>
                <input
                  type="number"
                  value={hardQuestions}
                  onChange={(e) => setHardQuestions(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">Negative Marks</label>
                <input
                  type="number"
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">Total Marks</label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <label className="block font-medium text-gray-700">Upload JSON/Excel Files:</label>
              <input
                type="file"
                accept=".json, .xlsx"
                onChange={handleFileUpload}
                multiple
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8 p-6">
            <button
              onClick={generateMCQs}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Generate MCQs
            </button>
            <button
              onClick={createTest}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Save Quiz
            </button>
            {/* <button
              onClick={generatePDF}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Download PDF
            </button> */}
            <button
  onClick={generateExcel}
  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
>
  Download Excel
</button>

          </div>

          {/* Display Generated Sets */}
          <div className="bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 p-4 border-b">Generated Sets</h3>
            {selectedSets.map((set) => (
              <div key={set.id} className="p-4 border-b">
                <h4 className="text-lg font-semibold mb-2">Set {set.id}</h4>
                <ul className="divide-y divide-gray-200">
                  {set.questions.map((q, index) => (
                    <li key={index} className="py-2">
                      <p className="font-medium">{q.question_text ||q.question}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-sm text-gray-600">{q.options.join(', ')}</span>
                        <span className="text-sm text-gray-500">Correct: {q.options[q.correct_option]}</span>
                        <span className={`badge ${q.difficulty}`}>{q.difficulty}</span>
                        <span className="text-sm text-gray-500">{q.marks} marks</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MCQGenerator;

// // above wroking correct beffore adding set fucntonality



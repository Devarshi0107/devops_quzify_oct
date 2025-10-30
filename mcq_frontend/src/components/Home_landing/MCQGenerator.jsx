


import React, { useState } from 'react';

const API = import.meta.env.VITE_BACKEND_API_URL;
const MCQGenerator = () => {
  const [totalMarks, setTotalMarks] = useState('');
  const [easyQuestions, setEasyQuestions] = useState('');
  const [mediumQuestions, setMediumQuestions] = useState('');
  const [hardQuestions, setHardQuestions] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filename, setFilename] = useState('');

  const [examName, setExamName] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTimeRange, setScheduleTimeRange] = useState('');
  const [branch, setBranch] = useState('');
  const [batch, setBatch] = useState('');
  const [rollNumberRange, setRollNumberRange] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFilename(file.name); 

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setQuestions(json.questions); 
      } catch (error) {
        console.error("Invalid JSON file:", error);
      }
    };

    reader.readAsText(file);
  };

  const generateMCQs = () => {
    const selected = [];

    const easy = questions.filter(q => q.difficulty === 'easy');
    const medium = questions.filter(q => q.difficulty === 'medium');
    const hard = questions.filter(q => q.difficulty === 'hard');

    const getRandomQuestions = (arr, count) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    selected.push(...getRandomQuestions(easy, easyQuestions));
    selected.push(...getRandomQuestions(medium, mediumQuestions));
    selected.push(...getRandomQuestions(hard, hardQuestions));

    setSelectedQuestions(selected);
  };

  const createTest = async () => {
    if (selectedQuestions.length === 0) {
      alert("No questions to save.");
      return;
    }

    try {
      const response = await fetch(
        // 'http://localhost:3001/api/save-quiz'
        `${API}http://localhost:3001/api/save-quiz`
        , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          teacher_name: "Teacher's Name", 
          exam_name: examName,
          schedule_date: scheduleDate,
          schedule_time_range: scheduleTimeRange,
          branch,
          batch,
          roll_number_range: rollNumberRange,
          questions: selectedQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create test');
      }

      alert('Test created successfully');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>MCQ Generator</h2>
      <div>
        <label>Upload JSON File:</label>
        <input type="file" accept=".json" onChange={handleFileUpload} />
      </div>
      <div>
        <label>Exam Name: lhjghhhj</label>
        <input
          type="text"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
        />
      </div>
      <div>
        <label>Schedule Date:</label>
        <input
          type="date"
          value={scheduleDate}
          onChange={(e) => setScheduleDate(e.target.value)}
        />
      </div>
      <div>
        <label>Schedule Time Range:</label>
        <input
          type="text"
          placeholder="e.g., 10:00 AM - 12:00 PM"
          value={scheduleTimeRange}
          onChange={(e) => setScheduleTimeRange(e.target.value)}
        />
      </div>
      <div>
        <label>Branch:</label>
        <input
          type="text"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        />
      </div>
      <div>
        <label>Batch:</label>
        <select
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        >
          <option value="">Select Batch</option>
          <option value="2022">2022</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
        </select>
      </div>
      <div>
        <label>Roll Number Range:</label>
        <input
          type="text"
          placeholder="e.g., 1-50"
          value={rollNumberRange}
          onChange={(e) => setRollNumberRange(e.target.value)}
        />
      </div>
      <div>
        <label>Total Marks:</label>
        <input
          type="number"
          value={totalMarks}
          onChange={(e) => setTotalMarks(e.target.value)}
        />
      </div>
      <div>
        <label>Number of Easy Questions:</label>
        <input
          type="number"
          value={easyQuestions}
          onChange={(e) => setEasyQuestions(e.target.value)}
        />
      </div>
      <div>
        <label>Number of Medium Questions:</label>
        <input
          type="number"
          value={mediumQuestions}
          onChange={(e) => setMediumQuestions(e.target.value)}
        />
      </div>
      <div>
        <label>Number of Hard Questions:</label>
        <input
          type="number"
          value={hardQuestions}
          onChange={(e) => setHardQuestions(e.target.value)}
        />
      </div>
      <button onClick={generateMCQs}>Generate MCQs</button>
      <button onClick={createTest}>Create Test</button>

      {selectedQuestions.length > 0 && (
        <div>
          <h3>Selected Questions</h3>
          <ul>
            {selectedQuestions.map((q, index) => (
              <li key={index}>
                <strong>Q:</strong> {q.question} <br />
                <strong>Options:</strong> {q.options.join(', ')} <br />
                <strong>Answer:</strong> {q.answer} <br />
                <strong>Difficulty:</strong> {q.difficulty} <br />
                <strong>Marks:</strong> {q.marks}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MCQGenerator;

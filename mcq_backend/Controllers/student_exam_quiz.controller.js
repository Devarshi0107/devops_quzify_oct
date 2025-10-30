
const Quiz = require('../models/Quiz.models');
const StudentQuizAttempt = require('../models/StudentQuizAttemptSchema.model');
const Leaderboard = require('../models/LeaderboardSchema.model');
const Student = require('../models/student.model');
const mongoose = require("mongoose");
// const SubmissionQueue = require('../models/SubmissionQueueSchema'); 


exports.autosaveExam = async (req, res) => {
    try {
      const { student, quiz, responses } = req.body;
  
      if (!student || !quiz || !responses || !Array.isArray(responses)) {
        return res.status(400).json({ message: "Student ID, Quiz ID, and valid responses array are required" });
      }
  
      if (!mongoose.Types.ObjectId.isValid(student)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }
      if (!mongoose.Types.ObjectId.isValid(quiz)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
  
      const studentData = await Student.findById(student).select('rollNo');
      if (!studentData) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      const quizData = await Quiz.findById(quiz)
        .select('sets assigned_sets')
        .lean();
      if (!quizData) {
        return res.status(404).json({ message: "Quiz not found" });
      }
  
      const formattedRoll = studentData.rollNo;
      
      const assignedSet = quizData.assigned_sets[formattedRoll];
      if (!assignedSet) {
        return res.status(403).json({ message: "No set assigned for this student" });
      }
  
      const assignedSetObj = quizData.sets.find(s => s.set_number === assignedSet);
      if (!assignedSetObj) {
        return res.status(404).json({ message: `Set number ${assignedSet} not found in quiz` });
      }
      const assignedSetQuestions = assignedSetObj.questions || [];
      const validQuestionIds = new Set(assignedSetQuestions.map(q => q._id.toString()));
  
      const existingSubmittedAttempt = await StudentQuizAttempt.findOne({ student, quiz, submitted: true });
      if (existingSubmittedAttempt) {
        return res.status(400).json({ message: 'Exam already submitted!' });
      }
  
      let attempt = await StudentQuizAttempt.findOne({ student, quiz });
      if (!attempt) {
        attempt = new StudentQuizAttempt({ 
          student, 
          quiz, 
          assigned_set: assignedSet,
          responses: [] 
        });
      } else {
        if (attempt.responses && attempt.responses.length) {
          attempt.responses = attempt.responses.filter(r => r.question_id);
        }
      }
  
      for (const newResponse of responses) {
        if (!newResponse.question_id) {
          console.error("Missing question_id in newResponse:", newResponse);
          return res.status(400).json({ message: "Each response must include a valid question_id" });
        }
        
        let questionId;
        try {
          questionId = new mongoose.Types.ObjectId(newResponse.question_id);
        } catch (err) {
          console.error("Invalid question_id format:", newResponse.question_id);
          return res.status(400).json({ message: "Invalid question_id format" });
        }
  
        if (!validQuestionIds.has(questionId.toString())) {
          return res.status(403).json({ 
            message: `Question ${questionId.toString()} is not in the assigned set ${assignedSet}`
          });
        }
  
        const existingIndex = attempt.responses.findIndex(r => {
          if (!r.question_id) {
            console.error("Existing response missing question_id:", r);
            return false;
          }
          return r.question_id.toString() === questionId.toString();
        });
  
        if (existingIndex > -1) {
          attempt.responses[existingIndex] = {
            question_id: questionId,
            selected_option: newResponse.selected_option,
            status: newResponse.status || (newResponse.selected_option !== null ? 'answered' : 'not-visited'),
            is_correct: newResponse.is_correct || false,
            set_number: assignedSet
          };
        } else {
          attempt.responses.push({
            question_id: questionId, 
            selected_option: newResponse.selected_option,
            status: newResponse.status || (newResponse.selected_option !== null ? 'answered' : 'not-visited'),
            is_correct: newResponse.is_correct || false,
            set_number: assignedSet
          });
        }
      }
  
      await attempt.save();
      return res.status(200).json({ 
        message: "Responses auto-saved successfully", 
        attempt: {
          _id: attempt._id,
          assigned_set: attempt.assigned_set,
          response_count: attempt.responses.length
        }
      });
    } catch (error) {
      console.error("Auto-save error:", error);
      return res.status(500).json({ 
        message: error.message.startsWith('Question') ? error.message : "Internal server error during auto-save" 
      });
    }
  };



exports.checkSubmission = async (req, res) => {
    try {
      const { student, quiz } = req.query;
  
      const attempt = await StudentQuizAttempt.findOne({ student, quiz, submitted: true });
      if (attempt) {
        return res.status(200).json({ submitted: true, message: 'This exam is already submitted.' });
      }
  
      return res.status(200).json({ submitted: false, message: 'This exam is not yet submitted.' });
    } catch (error) {
      console.error('Check Submission Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };




exports.submitExam = async (req, res) => {
  try {
    const { student, quiz, responses } = req.body;

    if (!student || !quiz || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ message: 'Student ID, Quiz ID, and valid responses array are required!' });
    }

    const existingAttempt = await StudentQuizAttempt.findOne({ student, quiz, submitted: true });
    if (existingAttempt) {
      return res.status(400).json({ message: 'Exam already submitted!' });
    }

    let attempt = await StudentQuizAttempt.findOne({ student, quiz });
    if (!attempt) {
      return res.status(400).json({ message: 'No saved attempt found!' });
    }

    const studentData = await Student.findById(student).select('rollNo');
    if (!studentData) {
      return res.status(404).json({ message: "Student not found" });
    }

    const quizData = await Quiz.findById(quiz)
      .select('sets assigned_sets negative_marks_per_question')
      .lean();

    const penalty = quizData.negative_marks_per_question;

    if (!quizData) {
      return res.status(404).json({ message: 'Quiz not found!' });
    }

    const formattedRoll = studentData.rollNo;

    const assignedSet = quizData.assigned_sets[formattedRoll];
    if (!assignedSet) {
      return res.status(403).json({ message: "No set assigned for this student" });
    }

    const assignedSetObj = quizData.sets.find(s => s.set_number === assignedSet);
    if (!assignedSetObj) {
      return res.status(404).json({ message: `Assigned set ${assignedSet} not found in quiz` });
    }
    const assignedSetQuestions = assignedSetObj.questions || [];
    const validQuestionIds = new Set(assignedSetQuestions.map(q => q._id.toString()));

    let score = 0;
    let totalMarks = 0;

    attempt.responses = responses.map(response => {
      if (!response.question_id) {
        console.error("Missing question_id in response:", response);
        return response;
      }
      const question = assignedSetQuestions.find(q =>
        q._id.toString() === response.question_id.toString()
      );
      if (!question) {
        console.error(`Question ${response.question_id} not found in assigned set ${assignedSet}`);
        return response;
      }

      totalMarks += question.marks;

      if (response.selected_option === question.correct_option) {
        score += question.marks;
        response.is_correct = true;
      } 
    
       else if (response.selected_option !== null) {
    score -= penalty;
    response.is_correct = false;
  } 
  else {
    response.is_correct = false;
  }
      response.set_number = assignedSet;
      return response;
    });

    attempt.score = score;
    attempt.total_marks = totalMarks;
    attempt.submitted = true;
    attempt.submitted_at = new Date();
    await attempt.save();
    res.status(200).json({
      message: 'Exam submitted successfully!',
      score,
      totalMarks
    });
  } catch (error) {
    console.error('Submit Exam Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getLastAttempt = async (req, res) => {
    try {
        const { student, quiz } = req.query;

        if (!student || !quiz) {
            return res.status(400).json({ message: "Student ID and Quiz ID are required" });
        }

        const attempt = await StudentQuizAttempt.findOne({ student, quiz });

        if (!attempt) {
            return res.status(404).json({ message: "No saved attempt found" });
        }

        return res.status(200).json({ message: "Attempt found", attempt });
    } catch (error) {
        console.error("Error fetching attempt:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getAttendedExam = async (req, res) => {
    try {
        const { student } = req.query;

        if (!student) {
            return res.status(400).json({ message: "Student ID is required" });
        }

        const attempts = await StudentQuizAttempt.find({ student });

        if (!attempts.length) {
            return res.status(404).json({ message: "No exam attempts found for this student." });
        }

        return res.status(200).json({ message: "Attempts found", results: attempts });
    } catch (error) {
        console.error("Error fetching student marks:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

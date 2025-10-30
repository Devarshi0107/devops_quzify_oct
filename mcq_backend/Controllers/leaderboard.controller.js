const Leaderboard = require('../models/LeaderboardSchema.model');
const StudentQuizAttempt = require('../models/StudentQuizAttemptSchema.model');
const Student = require('../models/student.model');
const mongoose = require("mongoose");
const Quiz = require('../models/Quiz.models'); 

// Function to update leaderboard when an exam is submitted


// exports.getLeaderboard = async (req, res) => {
//     let { quizId } = req.params;
    
//     console.log("from the backend quizId is : ",quizId)
//     try {
//       // Find the leaderboard for the quiz
//     //   quizId = new mongoose.Types.ObjectId(quizId);

//       const leaderboard = await Leaderboard.findOne({ quiz: quizId })
//         .populate('rankings.student', 'name') // Populate student details if needed
//         .exec();
//     console.log("in backend leaderboard data is: ",leaderboard)
//       if (!leaderboard) {
//         return res.status(404).json({ message: 'Leaderboard not found for this quiz' });
//       }
  
//       res.status(200).json({ leaderboard });
//     } catch (error) {
//       console.error('Error fetching leaderboard:', error);
//       res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
//     }
//   };
  
//before set leaderboard

exports.getLeaderboard = async (req, res) => {
  const { quizId } = req.params;
  const { rollNo } = req.query;
  
  console.log("Fetching leaderboard for:", quizId, "Roll:", rollNo);

  try {
      const quiz = await Quiz.findById(quizId)
          .select('assigned_sets branch batch exam_name total_marks schedule_date')
          .lean();

      if (!quiz) {
          return res.status(404).json({ message: 'Quiz not found' });
      }
      const setNumber = quiz.assigned_sets[rollNo];
      console.log("Assigned set for", rollNo, ":", setNumber);
      
      if (!setNumber) {
          return res.status(403).json({ 
              message: `No set assigned for roll number ${rollNo}` ,
              quizData: { 
                exam_name: quiz.exam_name,
                total_marks: quiz.total_marks,
                schedule_date: quiz.schedule_date
              }
          });
      }

      const leaderboard = await Leaderboard.findOne({
          quiz: quizId,
          setNumber: setNumber
      }).populate('rankings.student', 'name rollNo');

    leaderboard.rankings.sort((a, b) => b.score - a.score);

    const response = {
      leaderboard: leaderboard.toObject(),
      quizData: {
        exam_name: quiz.exam_name,
        total_marks: quiz.total_marks,
        schedule_date: quiz.schedule_date
      }
    };
    
      if (!leaderboard) {
          return res.status(404).json({ 
              message: `Leaderboard for set ${setNumber} not yet available` 
          });
      }

      res.status(200).json(response);


  } catch (error) {
      console.error('Leaderboard Error:', error);
      res.status(500).json({ 
          message: 'Failed to fetch leaderboard',
          error: error.message 
      });
  }
};

exports.getAllLeaderboards = async (req, res) => {
  try {
    const { quizId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Quiz ID is invalid" });
    }

    const attempts = await StudentQuizAttempt
      .find({ quiz: quizId, submitted: true })
      .populate('student', 'name rollNo')
      .lean();

    if (!attempts.length) {
      return res.status(404).json({ message: "No attempts found for this quiz" });
    }

    const bySet = attempts.reduce((acc, attempt) => {
      const setNumber = attempt.responses[0]?.set_number;
      if (setNumber == null) return acc;

      acc[setNumber] = acc[setNumber] || [];
      acc[setNumber].push({
        student: attempt.student,
        score: attempt.score,
        submittedAt: attempt.submitted_at,
      });
      return acc;
    }, {});

   

    const leaderboards = Object.entries(bySet)
  .map(([setNum, entries]) => ({
    setNumber: Number(setNum),
    rankings: entries
      .sort((a, b) => b.score - a.score)
      .map((e, idx) => ({
        rank:        idx + 1,
        rollNo:      e.student.rollNo,   
        name:        e.student.name,    
        score:       e.score,
        submittedAt: e.submittedAt
      }))
  }))
  .sort((a, b) => a.setNumber - b.setNumber);


    return res.status(200).json({ leaderboards });

  } catch (error) {
    console.error("Error fetching leaderboards:", error);
    return res.status(500).json({ message: "Failed to fetch leaderboards", error: error.message });
  }
};
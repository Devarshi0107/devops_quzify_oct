const Student = require('../models/student.model');

const signup = async (req, res) => {
  const { email, password} = req.body;


  try {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists!' });
    }

    const newStudent = new Student({ email, password});
    newStudent.extractDetailsFromEmail(email); 
    await newStudent.validate();
    await newStudent.save();
    
    const token = newStudent.generateAuthToken();
    newStudent.activeSession = token; 
    await newStudent.save();

    res.status(201).json({ token, student: newStudent });
  } catch (error) {
    res.status(500).json({ message: 'Error signing up', error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (student.activeSession) {
    }

    const token = student.generateAuthToken();
    student.activeSession = token; 
    await student.save();

    res.status(200).json({ token, student });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

const logout = async (req, res) => {
  const student = await Student.findById(req.user.id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  student.activeSession = null; 
  await student.save();

  res.status(200).json({ message: 'Logged out successfully' });
};

const Quiz = require('../models/Quiz.models'); 
const moment = require('moment-timezone');


const getStudentQuizzes = async (req, res) => {
  try {
    const { rollNo } = req.user;
    if (!rollNo) {
      return res.status(400).json({ error: "Student roll number not provided in token." });
    }

    const nowIST = moment().tz("Asia/Kolkata");
    const isD2D = rollNo.startsWith('D');
    
    const studentBranch = isD2D ? rollNo.substring(3, 5) : rollNo.substring(2, 4);
    const studentNumericPart = parseInt(isD2D ? rollNo.slice(5) : rollNo.slice(4));

    const quizzes = await Quiz.find({ branch: studentBranch })
      .populate('created_by', 'name')
      .lean();

    const eligibleQuizzes = quizzes.filter(quiz => {
      try {
        const quizBatch = quiz.batch;
        const regularPrefix = quizBatch.toString().slice(-2) + quiz.branch;
        const d2dPrefix = `D${(quizBatch - 1999).toString().padStart(2, '0')}${quiz.branch}`;

        const [startRoll, endRoll] = quiz.roll_number_range.split('-');
        const rangeNumericStart = parseInt(startRoll.slice(-3));
        const rangeNumericEnd = parseInt(endRoll.slice(-3));

        const matchesRegular = rollNo.startsWith(regularPrefix) && 
          studentNumericPart >= rangeNumericStart && 
          studentNumericPart <= rangeNumericEnd;

        const matchesD2D = rollNo.startsWith(d2dPrefix) && 
          studentNumericPart >= rangeNumericStart && 
          studentNumericPart <= rangeNumericEnd;

        return matchesRegular || matchesD2D;
      } catch (e) {
        return false;
      }
    });

    const processQuiz = (quiz) => {
      const assignedSet = quiz.assigned_sets[rollNo] ?? 1;
      const setObj = quiz.sets?.find(s => s.set_number === assignedSet);
      let filteredQuestions = [];
      
      if (setObj?.questions) {
        filteredQuestions = setObj.questions.map(({ correct_option, ...rest }) => rest);
      }
      
      return {
        ...quiz,
        questions: filteredQuestions,
        assigned_set: assignedSet
      };
    };

    const upcomingExams = [];
    const ongoingExams = [];

    eligibleQuizzes.forEach(quiz => {
      const examStart = moment(quiz.schedule_time_range.start);
      const examEnd = moment(quiz.schedule_time_range.end);
      const processed = processQuiz(quiz);

      if (nowIST.isBefore(examStart)) {
        upcomingExams.push({ ...processed, questions: [] });
      } else if (nowIST.isBetween(examStart, examEnd)) {
        ongoingExams.push(processed);
      }
    });

    res.status(200).json({ upcomingExams, ongoingExams });
  } catch (error) {
    console.error("Error fetching student quizzes:", error);
    res.status(500).json({ error: "Failed to fetch quizzes", details: error.message });
  }
};

module.exports = { getStudentQuizzes };

  const getExamById = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const exam = await Quiz.findById(quizId);
    
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }
    
    
    const { rollNo } = req.user; 
    const studentBatchPrefix = rollNo.substring(0, 2); // "22"
    const studentBranch = rollNo.substring(2, 4);        // "IT"
    
    if (String(exam.batch).slice(-2) !== studentBatchPrefix || exam.branch !== studentBranch) {
      return res.status(403).json({ error: "You are not authorized to access this exam." });
    }
    
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch exam details", details: error.message });
  }
};

module.exports = { signup, login, logout, getStudentQuizzes ,getExamById };



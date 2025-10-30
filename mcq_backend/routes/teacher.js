  const express = require('express');
  const bcrypt = require('bcrypt');
  const jwt = require('jsonwebtoken');
  const Teacher = require('../models/Teacher');
  const router = express.Router();
  const quizController = require('../Controllers/teacher.controller');
  const authenticateTeacher = require('../Middlewares/teacher_auth');
 
  const JWT_SECRET = process.env.SECRET_KEY;
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      const teacher = await Teacher.findOne({ email });
      if (!teacher) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, teacher.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: teacher._id,teacherID :teacher.teacherId, email: teacher.email ,role: teacher.role }, JWT_SECRET, {
        expiresIn: '1h', 
      });

      res.json({ message: 'Login  successful', token ,role: 'teacher'});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.get('/', async (req, res) => {
      try {
        const teachers = await Teacher.find().select('teacherName email branch'); 
        res.json(teachers);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

 
router.post('/change-password',authenticateTeacher, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const token = req.headers.authorization.split(' ')[1]; 

  try {
    const decoded = jwt.verify(token, JWT_SECRET); 
    const teacher = await Teacher.findById(decoded.id); 

    const isMatch = await bcrypt.compare(currentPassword, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    teacher.password = await bcrypt.hash(newPassword, 10);
    await teacher.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

  router.post('/save-quiz', authenticateTeacher, quizController.saveQuiz);

  router.get('/my-quizzes', authenticateTeacher, quizController.getMyQuizzes);
  router.get('/quizzes', authenticateTeacher, quizController.getAllQuizzes);

  router.put("/updatequiz/:quizId", authenticateTeacher, quizController.updateQuiz);
  router.delete("/deletequiz/:quizId", authenticateTeacher, quizController.deleteQuiz);

    module.exports = router;
    
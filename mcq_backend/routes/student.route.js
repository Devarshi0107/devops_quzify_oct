const express = require('express');
const { signup, login, logout } = require('../Controllers/student.controller');
const { authMiddleware } = require('../Middlewares/auth.middleware');
const router = express.Router();
const studentQuizController = require('../Controllers/student.controller');

router.post('/signup', signup);

router.post('/login', login);

router.post('/logout', authMiddleware, logout);

router.get('/filtered-quizzes', authMiddleware, studentQuizController.getStudentQuizzes);

router.get('/exam/:quizId', authMiddleware, studentQuizController.getExamById);

module.exports = router;

const express = require('express');
const { authMiddleware } = require('../Middlewares/auth.middleware');
const { autosaveExam, submitExam ,getLastAttempt,checkSubmission , getAttendedExam} = require('../Controllers/student_exam_quiz.controller');

const router = express.Router();

router.post('/autosave-exam', authMiddleware, autosaveExam);

router.post('/submit-exam', authMiddleware,submitExam);
router.get('/getlast-attempts',authMiddleware, getLastAttempt);
router.get('/check-submission', authMiddleware, checkSubmission);
router.get('/getattended-exam', authMiddleware, getAttendedExam);


module.exports = router;

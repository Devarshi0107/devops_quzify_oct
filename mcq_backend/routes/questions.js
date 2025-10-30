const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

router.post('/add', async (req, res) => {
  try {
    const questions = req.body.questions;
    const savedQuestions = await Question.insertMany(questions);
    res.json(savedQuestions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

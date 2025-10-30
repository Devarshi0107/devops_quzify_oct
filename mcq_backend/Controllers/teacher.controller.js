const Quiz = require('../models/Quiz.models');
const Teacher = require('../models/Teacher');
const Student = require("../models/student.model"); 

const mongoose = require("mongoose");


exports.saveQuiz = async (req, res) => {
  try {
    const { 
      filename, 
      exam_name, 
      schedule_date, 
      schedule_time_range, 
      branch, 
      batch, 
      roll_number_range, 
      negative_marks_per_question,
      total_sets, 
      sets 
    } = req.body;

    if (!filename || !exam_name || !schedule_date || !schedule_time_range || 
        !branch || !batch || !roll_number_range || !total_sets || !sets) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [startRoll, endRoll] = roll_number_range.toUpperCase().split("-");
    const branchCode = branch.toUpperCase();
    const currentYear = batch.toString().slice(-2); // 2022 → "22"
    const d2dYear = (parseInt(currentYear) + 1).toString().padStart(2, '0'); // "23"

    // Extract numeric range (last 3 digits)
    const startNum = startRoll.slice(-3);
    const endNum = endRoll.slice(-3);

    const conditions = {
      $or: [
        { 
          rollNo: { 
            $regex: new RegExp(`^${currentYear}${branchCode}\\d{3}$`),
            $gte: `${currentYear}${branchCode}${startNum}`,
            $lte: `${currentYear}${branchCode}${endNum}`
          }
        },
        // D2D students (D23IT001-D23IT200)
        { 
          rollNo: { 
            $regex: new RegExp(`^D${d2dYear}${branchCode}\\d{3}$`),
            $gte: `D${d2dYear}${branchCode}${startNum}`,
            $lte: `D${d2dYear}${branchCode}${endNum}`
          }
        }
      ]
    };

    const activeStudents = await Student.find(conditions, { rollNo: 1, _id: 0 });

    const assigned_sets = new Map();
    activeStudents.forEach((student, index) => {
      const setNumber = (index % total_sets) + 1;
      assigned_sets.set(student.rollNo, setNumber);
    });

    const teacher = await Teacher.findOne({ _id: req.teacherId });
    const newQuiz = new Quiz({
      filename,
      exam_name,
      schedule_date,
      schedule_time_range,
      branch: branchCode,
      batch,
      roll_number_range,
      negative_marks_per_question: negative_marks_per_question,
      total_sets,
      sets,
      assigned_sets: Object.fromEntries(assigned_sets),
      created_by: teacher._id
    });

    await newQuiz.save();
    res.status(201).json({ message: "Quiz saved successfully", quiz: newQuiz });

  } catch (error) {
    console.error("Error saving quiz:", error);
    res.status(500).json({ error: "Failed to save quiz", details: error.message });
  }
};
exports.getMyQuizzes = async (req, res) => {
  try {
    console.log("Teacher id is:", req.teacherId);
    const quizzes = await Quiz.find({ created_by: req.teacherId });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes', details: error.message });
  }
};


exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json({ quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: 'Failed to fetch quizzes', details: error.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { schedule_date, schedule_time_range } = req.body;

    if (!schedule_date || !schedule_time_range?.start || !schedule_time_range?.end) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const isValidTimeFormat = (dateString) => !isNaN(Date.parse(dateString));
    if (!isValidTimeFormat(schedule_time_range.start) || !isValidTimeFormat(schedule_time_range.end)) {
      return res.status(400).json({ error: "Invalid time format" });
    }

    const updatePayload = {
      schedule_date,
      schedule_time_range: {
        start: new Date(schedule_time_range.start),
        end: new Date(schedule_time_range.end)
      }
    };

    const updatedQuiz = await Quiz.findOneAndUpdate(
      { _id: quizId, created_by: req.teacherId },
      updatePayload,
      { new: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({ error: "Quiz not found or unauthorized" });
    }

    res.status(200).json({ message: "Quiz updated successfully", quiz: updatedQuiz });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ error: "Failed to update quiz", details: error.message });
  }
};
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const deletedQuiz = await Quiz.findOneAndDelete({ _id: quizId, created_by: req.teacherId });

    if (!deletedQuiz) {
      return res.status(404).json({ error: "Quiz not found or unauthorized" });
    }

    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ error: "Failed to delete quiz", details: error.message });
  }
};

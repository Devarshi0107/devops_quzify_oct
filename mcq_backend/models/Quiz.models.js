


const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  exam_name: { type: String, required: true },
  schedule_date: { type: Date, required: true },
  schedule_time_range: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  branch: { type: String, required: true },
  batch: { type: Number, required: true },
  roll_number_range: { type: String, required: true },
  questions: [
    {
      question_text: { type: String, required: true },
      options: [{ type: String, required: true }],
      correct_option: { type: Number, required: true },
      marks: { type: Number, required: true },
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    }
  ],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true } 

, 
negative_marks_per_question: { type: Number, required: true },
total_sets: { type: Number, required: true },
sets: [
  {
    set_number: { type: Number, required: true },
    questions: [
      {
        question_text: { type: String, required: true },
        options: [{ type: String, required: true }],
        correct_option: { type: Number, required: true },
        marks: { type: Number, required: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true }
      }
    ]
  }
],
assigned_sets: {
  type: Map,
  of: Number,
  required: true
}
});

module.exports = mongoose.model('Quiz', QuizSchema);

const mongoose = require('mongoose');

const StudentQuizAttemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },

  responses: [
    {
      question_id: { type: mongoose.Schema.Types.ObjectId, required: true },
      set_number: { type: Number, required: true }, 
      selected_option: { type: Number, default: null },
      is_correct: { type: Boolean, default: false },
      status: { 
        type: String, 
        enum: ['not-visited', 'answered', 'flagged'], 
        default: 'not-visited' 
      }
    }
  ],
  score: { type: Number, default: 0 },
  total_marks: { type: Number, default: 0 },
  submitted_at: { type: Date },
  submitted: { type: Boolean, default: false }
});

module.exports = mongoose.model('StudentQuizAttempt', StudentQuizAttemptSchema);

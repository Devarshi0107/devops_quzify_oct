const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const emailRegex = /^(D\d{2}|\d{2})(CS|IT|CE)\d{3}@charusat\.edu\.in$/; 
const studentSchema = new mongoose.Schema({
  email: { 
    type: String, 
    unique: true, 
    required: true,
    match: emailRegex 
  },
  password: { 
    type: String, 
    required: true 
  },
  rollNo: { 
    type: String, 
    unique: true, 
    required: true 
  },
  branch: { 
    type: String, 
    enum: ['CS', 'IT', 'CE'], 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['student', 'teacher', 'admin'], 
    default: 'student' 
  },
  activeSession: { 
    type: String, 
    default: null 
  },
  attendedExams: [{
    examId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Exam' 
    },
    questions: [{
      questionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Question' 
      },
      answer: { 
        type: String, 
        required: true 
      },
      marks: { 
        type: Number, 
        default: 0 
      }
    }],
    totalMarks: { 
      type: Number, 
      default: 0 
    },
    status: { 
      type: String, 
      enum: ['completed', 'ongoing'], 
      default: 'ongoing' 
    },
    assigned_set: { 
      type: Number, 
      default: null 
    }
  }],
  otp: { 
    type: String, 
    default: null 
  },
  otpExpires: { 
    type: Date, 
    default: null 
  },
}, { timestamps: true });

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{4,10}$/;
  if (!passwordRegex.test(this.password)) {
    return next(new Error('Password must be alphanumeric and between 4 to 10 characters.'));
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

studentSchema.methods.generateAuthToken = function () {
  const payload = { id: this._id, role: this.role, rollNo: this.rollNo };
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '4h' });
};

studentSchema.methods.extractDetailsFromEmail = function (email) {
  
  const emailLocalPart = email.split('@')[0];
  
  if (emailLocalPart.startsWith('D')) {
    this.branch = emailLocalPart.substring(3, 5);
  } else {
    this.branch = emailLocalPart.substring(2, 4);
  }
  
  this.rollNo = emailLocalPart; 
};

module.exports = mongoose.model('Student', studentSchema);

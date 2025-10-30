const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, unique: true, required: true },
  teacherName: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  phoneNumber: { type: String, required: true },
  branch: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "teacher" }
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;

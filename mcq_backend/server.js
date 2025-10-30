
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt'); 

const teacherRoutes = require('./routes/teacher'); 

const app = express();
const jwt = require('jsonwebtoken'); 
const SECRET_KEY = process.env.SECRET_KEY; 
const credentialsRoute = require('./routes/teacher_credentials');

const studentRoutes = require('./routes/student.route');
const authRoutes = require('./routes/auth.route'); 
const quizRoutes = require('./routes/teacher'); 
const student_quiz_route = require('./routes/student_quiz.route');
const leaderboardroute = require('./routes/leaderboard.route');
const { metricsMiddleware, promClient } = require('./metrics');

app.use(cors({
  origin: [ "http://localhost:3000",
  "http://localhost:5173",
  "http://quizify-frontend-dev-v2.s3-website-us-east-1.amazonaws.com"
],
  credentials: true
}));
app.use(bodyParser.json());
app.use(metricsMiddleware);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Backend is healthy 🚀" });
});
// metrics endpoint - Prometheus scrapes this
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await promClient.register.metrics();
    res.set('Content-Type', promClient.register.contentType);
    res.end(metrics);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

const Admin = require('./models/Admin');

const    authenticateAdmin = require('./Middlewares/admin_auth');

const adminUsername = process.env.ADMIN_USERNAME || 'admin';
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });

  if (admin && bcrypt.compareSync(password, admin.password)) {
    const token = jwt.sign({ id: admin._id, username: admin.username , role: 'admin'}, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).send({
      message: 'Login successful',
      token: token ,
      role : 'admin'      
    });
  } else {
    res.status(401).send({ error: 'Invalid username or password' });
  }
});

app.post('/api/admin/change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).send({ error: 'Old and new passwords are required' });
  }

  try {
    const admin = await Admin.findOne({ username: adminUsername });

    if (!admin) {
      return res.status(404).send({ error: 'Admin user not found' });
    }

    const isMatch = bcrypt.compareSync(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(401).send({ error: 'Old password is incorrect' });
    }

    admin.password = bcrypt.hashSync(newPassword, 10);
    await admin.save();
    res.status(200).send({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Error while changing password:', error);
    res.status(500).send({ error: 'An error occurred while changing the password' });
  }
});


const PORT=process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0",() => {
  console.log(`Server is running on port ${PORT}`);
});




const scheduleAutoSubmit = async (student, quiz, endTime) => {
  const now = new Date();
  const timeRemaining = new Date(endTime) - now;

  console.log(`Exam Start Time: ${now}`);
  console.log(`Student ID: ${student}`);
  console.log(`Quiz ID: ${quiz}`);
  console.log(`Scheduled Auto-Submit Time: ${endTime}`);
  console.log(`Time remaining (ms): ${timeRemaining}`);

  if (timeRemaining > 0) {
      setTimeout(async () => {
          console.log(`Auto-submitting exam for Student ${student} on Quiz ${quiz}...`);
          try {
              const response = await axios.post("http://localhost:3001/api/student-quiz/submit-exam", { student, quiz });
              console.log(`Auto-submit completed successfully for Student ${student} on Quiz ${quiz}.`);
          } catch (error) {
              console.error(`Auto-submit failed for Student ${student} on Quiz ${quiz}:`, error);
          }
      }, timeRemaining);
  } else {
      console.log(`The end time has already passed. The auto-submit cannot be scheduled.`);
  }
};

app.post('/api/student-quiz/start-exam', async (req, res) => {
  try {
    const { student, quiz, endTime } = req.body;
  
    console.log(`Starting exam for Student ID: ${student}`);
    console.log(`Quiz ID: ${quiz}`);
    console.log(`Starting Time: ${new Date()}`);
    console.log(`Ending Time: ${endTime}`);

    scheduleAutoSubmit(student, quiz, endTime);
  
    res.json({ message: 'Exam started. Auto-submit scheduled!' });
  } catch (error) {
    console.error('Error starting exam:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.use('/api/teacher/credentials',authenticateAdmin, credentialsRoute);

app.use('/api/allteachers', authenticateAdmin,teacherRoutes);

app.use('/api/teacher', teacherRoutes);



app.use('/api/students', studentRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server Error' });
});

app.use('/api/auth', authRoutes);

app.use('/api/quiz', quizRoutes);

app.use('/api/student-quiz', student_quiz_route);

app.use('/api/leaderboard', leaderboardroute);


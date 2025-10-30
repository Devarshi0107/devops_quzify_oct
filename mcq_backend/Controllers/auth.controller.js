
const Student = require('../models/student.model');
const bcrypt = require('bcrypt');
const { sendOTPEmail } = require('../utils/signup_otp_emailservice');
const OTP = require('../models/otp.model');  // Import OTP model

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

const emailRegex = /^(D\d{2}|\d{2})(CS|IT|CE)\d{3}@charusat\.edu\.in$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000); 

    const otpRecord = new OTP({ email, otp });
    await otpRecord.save();

    await sendOTPEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to your email. Please verify to complete registration.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during OTP generation', error });
  }
};

const verifyAndSignUp = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    console.log(password)

    // Check if OTP exists in the database and matches
    const otpRecord = await OTP.findOne({ email, otp });

    if (otpRecord) {
      // OTP is valid, proceed to register the user

      // Check if user already exists
      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({ message: 'Email is already registered' });
      }

      // Create the student object
      const student = new Student({ email, password });
      student.extractDetailsFromEmail(email);  // Set roll number and branch from email

      
      // Save student in the database
      await student.save();

      // Respond to the client
      res.status(201).json({ message: 'Student registered successfully' });

      // Delete OTP after successful verification and signup
      await OTP.deleteOne({ email }); // Prevent reuse of OTP
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
  }catch (error) {  
    console.error('An error occurred:', error.message || error);  
    res.status(500).json({  
      message: error.message || 'An unexpected error occurred. Please try again later.',  
    });  
  }
  
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = student.generateAuthToken();

    student.activeSession = token;
    await student.save();

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during login', error });
  }
};

const logout = async (req, res) => {
    try {
      const studentId = req.user.id; 
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      student.activeSession = null; 
      await student.save();
  
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error during logout', error });
    }
  };
  
  

module.exports = { sendOTP , login, logout , verifyAndSignUp   };

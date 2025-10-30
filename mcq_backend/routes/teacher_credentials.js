


const express = require('express');
const bcrypt = require('bcrypt'); 
const router = express.Router();
const { adminsendEmail } = require('../utils/admin_emailService');
const Teacher = require('../models/Teacher'); 


async function generateUniqueTeacherId() {
  let isUnique = false;
  let teacherId;

  while (!isUnique) {
    teacherId = Math.floor(100000 + Math.random() * 900000).toString();

    const existingTeacher = await Teacher.findOne({ teacherId });
    if (!existingTeacher) {
      isUnique = true; 
    }
  }

  return teacherId;
}
router.post('/create', async (req, res) => {
  const { teacherName, email, phoneNumber, branch } = req.body;
  const randomPassword = generateRandomPassword(); 

  try {
    const existingEmail = await Teacher.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const existingPhone = await Teacher.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already registered.' });
    }

    const teacherId = await generateUniqueTeacherId();

    const hashedPassword = bcrypt.hashSync(randomPassword, 10);

    const newTeacher = new Teacher({
      teacherId, 
      teacherName,
      email,
      phoneNumber,
      branch,
      password: hashedPassword, 
    });

    try {
      await newTeacher.save();
      console.log('Teacher saved successfully!');
    } catch (dbSaveError) {
      console.error('Error saving teacher to the database:', dbSaveError);
      return res.status(500).json({ message: 'Error saving teacher to the database.' });
    }

   
    try {
      await adminsendEmail(email, teacherName, randomPassword);
      console.log('Email sent successfully!');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return res.status(500).json({ message: 'Error sending email.' });
    }

    res.status(200).json({ message: 'Teacher created and email sent successfully!' });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'Unexpected server error.' });
  }
});

function generateRandomPassword(length = 10) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

module.exports = router;

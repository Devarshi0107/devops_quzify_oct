
const nodemailer = require('nodemailer');

const adminsendEmail = (recipientEmail, teacherName, password) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL, 
      pass: process.env.GMAIL_PASS,  
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_EMAIL, 
    to: recipientEmail,
    subject: 'Teacher Account Created For Online Quiz Platform',
    text: `Hello ${teacherName},\n\nYour account has been created.\nYour temporary password is: ${password}\nPlease log in and change your password.\n\nRegards,\nAdmin Team`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { adminsendEmail };

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter (Forced Port 587 for Render)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Port 587 ke liye ye false hona zaroori hai
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false // Cloud network blocks ko bypass karne ke liye
    }
  });

  // 2. Define email options
  const mailOptions = {
    from: 'Xavier AlumniConnect <no-reply@xavier.edu>',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter (Gmail configuration)
  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Ye 16-digit ka App Password hona chahiye
  },
});

  // 2. Define email options
  const mailOptions = {
    from: 'Xavier AlumniConnect <no-reply@xavier.edu>',
    to: options.email,
    subject: options.subject,
    html: options.message, // Hum HTML bhej rahe hain taaki button sundar dikhe
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
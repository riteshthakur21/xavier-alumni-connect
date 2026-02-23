const nodemailer = require('nodemailer');

// const sendEmail = async (options) => {
//   // 1. Create a transporter (Gmail configuration)
//   const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // Use TLS instead of SSL
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // Ye 16-digit ka App Password hona chahiye
//   },
// });

//   // 2. Define email options
//   const mailOptions = {
//     from: 'Xavier AlumniConnect <no-reply@xavier.edu>',
//     to: options.email,
//     subject: options.subject,
//     html: options.message, // Hum HTML bhej rahe hain taaki button sundar dikhe
//   };

//   // 3. Actually send the email
//   await transporter.sendMail(mailOptions);
// };
const sendEmail = async (options) => {
  // 1. Create a transporter using Service instead of Host/Port
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Nodemailer khud best settings dhoond lega
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Spaces hata kar 16 letters wala code
    },
    tls: {
      rejectUnauthorized: false // Ye line network blocks bypass karne mein help karti hai
    }
  });

  // 2. Define email options (baki code waisa hi rehne do)
  const mailOptions = {
    from: 'Xavier AlumniConnect <no-reply@xavier.edu>',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
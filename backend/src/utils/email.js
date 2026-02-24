const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Xavier AlumniConnect',
          email: process.env.EMAIL_USER // Tera verified Gmail id
        },
        to: [
          {
            email: options.email
          }
        ],
        subject: options.subject,
        htmlContent: options.message
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo Error:", errorData);
      throw new Error("Email send failed");
    }

    console.log("Email sent successfully!"); 
  } catch (error) {
    console.error("API Error:", error);
  }
};

module.exports = sendEmail;
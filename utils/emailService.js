const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: process.env.SMTP_PORT || 2525,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  family: 4, // Force IPv4 to avoid ENETUNREACH on IPv6
});

const sendEmail = async (to, subject, text, html, from = null) => {
  try {
    const info = await transporter.sendMail({
      from:
        from ||
        process.env.SMTP_FROM ||
        '"GCS Hospital" <no-reply@gcshospital.com>',
      to,
      subject,
      text,
      html,
    });
    
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't throw error to prevent breaking the flow if email fails, just log it
    // or return null to indicate failure
    return null;
  }
};

module.exports = sendEmail;

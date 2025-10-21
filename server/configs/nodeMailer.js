import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  }
});


const sendEmail = async (to, subject, body) => {
  const mailOptions = {
    from: `"PingUp Social" <${process.env.SENDER_EMAIL}>`,
    to,
    subject,
    html: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Gửi mail thành công");
  } catch (error) {
    console.error("Lỗi:", error);
  }
};

export default sendEmail;
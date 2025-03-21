import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  data: string,
  isHtml: boolean = false
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      replyTo: "g4grades@gmail.com",
      ...(isHtml ? { html: data } : { text: data }),
    };

    await transporter.sendMail(mailOptions);
    console.log(`📩 Email sent to ${to}`);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { success: false, message: "Email failed to send" };
  }
};

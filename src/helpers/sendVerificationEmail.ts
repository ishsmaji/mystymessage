import nodemailer from 'nodemailer';
import { ApiResponse } from "@/types/ApiResponse";

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifycode: string
): Promise<ApiResponse> {
  try {
    // HTML template for verification email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Mystery Message Account</h2>
        <p>Hello ${username},</p>
        <p>Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px;">
          <strong>${verifycode}</strong>
        </div>
        <p>This code will expire in 1 hour. Please do not share it with anyone.</p>
        <p>Best regards,<br>Mystery Message Team</p>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME, // Your Gmail address
      to: email,
      subject: "Mystery Message Verification Code",
      html: htmlContent
    });

    return { success: true, message: "Verification email sent successfully" };
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    return { success: false, message: "Failed to send verification email" };
  }
}
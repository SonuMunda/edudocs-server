require("dotenv").config();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const sendForgotPasswordMail = async (user) => {
  const secretKey = process.env.FORGOT_PASSWORD_SECRET;

  const verificationToken = jwt.sign({ userId: user._id }, secretKey, {
    expiresIn: "1h",
  });

  const link = `${process.env.SERVER_URL}/api/auth/reset-password-verification/${verificationToken}`;

  let fullName = user.firstName + " " + user.lastName;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: "Edudocs <no-reply@edudocs.netlify.app>",
      to: user.email,
      subject: "Welcome to Edudocs! Verify Your Email Address",
      html: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #444444; background-color: #f7f7f7; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #e2e2e2;">
    
    <!-- Header Section -->
    <div style="background-color: #0073e6; color: #ffffff; text-align: center; padding: 25px 20px;">
      <h1 style="margin: 0; font-weight: 700; font-size: 30px; letter-spacing: 1px;">EduDocs</h1>
    </div>

    <!-- Body Section -->
    <div style="padding: 30px 35px; line-height: 1.6;">
      <h2 style="color: #222222; font-size: 26px; font-weight: 600; margin-top: 0;">Reset Your Password</h2>

      <h3 style="color: #222222; font-size: 20px; font-weight: 500; margin-top: 0;">Hello, ${fullName}</h3>

      <p style="font-size: 16px; margin: 20px 0;">
        We received a request to reset the password for your EduDocs account. If you did not make this request, you can safely ignore this email.
      </p>

      <p style="text-align: center; margin: 40px 0;">
        <a href="${link}" target="_blank" 
           style="background-color: #0073e6; color: #ffffff; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 10rem; display: inline-block; box-shadow: 0 4px 12px rgba(0, 115, 230, 0.4); font-weight: 600; transition: background-color 0.3s ease;">
          Reset Password
        </a>
      </p>

      <p style="font-size: 14px; color: #888888; text-align: center; margin-bottom: 5px;">This link will expire in 1 hour.</p>
      <p style="font-size: 14px; color: #888888; text-align: center; margin-top: 0;">If you did not request a password reset, please ignore this email.</p>
    </div>

    <!-- Footer Section -->
    <div style="background-color: #f9f9f9; text-align: center; padding: 18px 20px; border-top: 1px solid #ddd;">
      <p style="font-size: 14px; color: #666666; margin: 0 0 4px;">Thank you,</p>
      <p style="font-size: 14px; color: #666666; margin: 0 0 12px;">The EduDocs Team</p>
      <div style="font-size: 12px; color: #aaa; letter-spacing: 0.5px;">
        &copy; ${new Date().getFullYear()} EduDocs. All rights reserved.
      </div>
    </div>
  </div>
</div>
`,
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message:
        "Verification link has been sent to your email. Please verify it. If not found in the inbox, check the spam folder.",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: "Error sending email. Please try again later.",
    };
  }
};

module.exports = sendForgotPasswordMail;

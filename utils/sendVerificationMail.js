const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const sendVerificationMail = async (user) => {
  const secretKey = process.env.SECRET_KEY;

  const verificationToken = jwt.sign({ id: user._id }, secretKey, {
    expiresIn: "1h",
  });

  const link = `${process.env.CLIENT_URL}/api/user/auth/verify/${user._id}/${verificationToken}`;

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
      from: "Edudocs <no-reply@edudocs.com>",
      to: user.email,
      subject: "Welcome to Edudocs! Verify Your Email Address",
      html: ` 
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 30px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <!-- Header Section -->
      <div style="background-color: #3498db; color: white; text-align: center; padding: 20px;">
        <h1 style="margin: 0; font-size: 28px;">Edudocs</h1>
       </div>
    
      <!-- Body Section -->
      <div style="padding: 20px;">
        <h2 style="color: #2c3e50; font-size: 24px; margin-top: 0;">Welcome to Edudocs!</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Thank you for signing up with Edudocs! We're excited to have you on board.</p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Please verify your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${link}" target="_blank" style="display: inline-block; background-color: #3498db; color: #ffffff; text-decoration: none; padding: 12px 25px; font-size: 16px; border-radius: 5px; box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);">Verify Email</a>
        </p>
        <p style="font-size: 14px; color: #999; text-align: center;">This link will expire in 1 hour.</p>
      </div>
    
      <!-- Footer Section -->
      <div style="background-color: #f4f4f4; text-align: center; padding: 15px; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 14px; color: #666; margin: 0;">Thank you,</p>
        <p style="font-size: 14px; color: #666; margin: 0;">The Edudocs Team</p>
        <div style="margin-top: 15px; font-size: 12px; color: #aaa;">
          &copy; ${new Date().getFullYear()} Edudocs. All rights reserved.
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

module.exports = sendVerificationMail;

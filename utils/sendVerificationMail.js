const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const sendVerificationMail = async (user) => {
  const secretKey = process.env.SECRET_KEY;

  const verificationToken = jwt.sign({ id: user._id }, secretKey, {
    expiresIn: "1h",
  });

  const link = `${process.env.SERVER_URL}api/auth/user/verify/${user._id}/${verificationToken}`;

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
      html: ` <div style="font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
            <div style="text-align: center; padding: 10px;">
              <h1 style="margin: 0; color: #2c3e50;">Edudocs</h1>
            </div>
            <h2 style="color: #2c3e50;">Welcome to Edudocs!</h2>
            <p>Thank you for signing up with Edudocs!</p>
            <p>Please verify your email address by clicking the link below:</p>
            <p style="text-align: center; margin : 1rem">
              <a href="${link}" target="_blank" style="background-color: #3498db; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px;">Verify Email</a>
            </p>
            <p>This link will expire in 1 hour.</p>
            <p>Thank you,</p>
            <p>The Edudocs Team</p>
            <div style="text-align: center; padding: 10px; border-top: 1px solid #ddd;">
              <small style="color: #999;">&copy; ${new Date().getFullYear()} Edudocs. All rights reserved.</small>
            </div>
          </div>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email Sent Successfully");

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

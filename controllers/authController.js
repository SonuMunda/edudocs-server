const { HttpStatusCode } = require("axios");
const User = require("../models/userModel");
const Upload = require("../models/userUpload");
const generateToken = require("../utils/generateToken");
const sendVerificationMail = require("../utils/sendVerificationMail");
const cloudinary = require("../config/cloudnaryConfig");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendForgotPasswordMail = require("../utils/sendForgotPasswordMail");
const { OAuth2Client } = require("google-auth-library");
const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { generateFromEmail } = require("unique-username-generator");

const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let username = generateFromEmail(email, 3);
    let isUsernameAvailable = await User.findOne({ username });

    while (isUsernameAvailable) {
      username = generateFromEmail(email, 3);
      isUsernameAvailable = await User.findOne({ username });
    }

    const existingUser = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (existingUser) {
      if (
        existingUser.username === username &&
        existingUser.emailVerified === true
      ) {
        return res.status(409).json({ message: "Username already in use" });
      }
      if (existingUser.email === email && existingUser.emailVerified) {
        return res.status(409).json({ message: "Email already in use" });
      }

      await Promise.all([
        existingUser.deleteOne({ _id: existingUser._id }),
        sendVerificationMail(existingUser),
      ]);

      return res.status(201).json({ message: "Verification email sent!" });
    }

    const user = new User({
      username,
      firstName,
      lastName,
      email,
      password,
    });

    await Promise.all([user.save(), sendVerificationMail(user)]);

    return res
      .status(HttpStatusCode.Created)
      .json({ message: "Verification email sent!" });
  } catch (error) {
    console.error("Error during signup:", error);
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Internal Server Error" });
  }
};

const verifyMail = async (req, res) => {
  const { id, token } = req.params;
  try {
    const user = await User.findById({ _id: id });
    if (!user) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "User not found" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded) {
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Invalid token" });
    }

    user.emailVerified = true;
    await user.save();

    setTimeout(() => {
      res.redirect(
        `${process.env.CLIENT_URL}/email-verified?email=${user.email}`
      );
    }, 1000);
  } catch (error) {
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message || "Oops Something went wrong!" });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "User not found" });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Invalid Email or Password" });
    }

    const token = generateToken(user);
    res.status(HttpStatusCode.Ok).json({
      message: "Signin Successful",
      token: token,
    });
  } catch (error) {
    console.error("Error during signin:", error);
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Internal Server Error" });
  }
};

const googleSignin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Token is required" });
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    if (!ticket) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      let username = generateFromEmail(payload.email, 3);
      let isUsernameAvailable = await User.findOne({ username });

      while (isUsernameAvailable) {
        username = generateFromEmail(payload.email, 3);
        isUsernameAvailable = await User.findOne({ username });
      }

      user = await User.create({
        username: username,
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        emailVerified: true,
        source: "google",
      });
    }

    const token = await generateToken(user);

    return res.status(200).json({
      message: "SignIn successful",
      token: token,
    });
  } catch (error) {
    console.error("Google SignIn Error:", error);
    return res.status(500).json({
      message: "Google Sign-In failed",
      error: error.message,
    });
  }
};

const newGoogleSignin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: "Token is required" });
    }

    oauth2Client.setCredentials({ access_token: accessToken });

    const { data } = await oauth2Client.request({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
    });

    let user = await User.findOne({ email: data.email });

    if (!user) {
      let username = generateFromEmail(data.email, 3);
      let isUsernameAvailable = await User.findOne({ username });

      while (isUsernameAvailable) {
        username = generateFromEmail(data.email, 3);
        isUsernameAvailable = await User.findOne({ username });
      }

      user = await User.create({
        username: username,
        firstName: data.given_name,
        lastName: data.family_name,
        email: data.email,
        emailVerified: true,
        source: "google",
      });
    }

    const token = await generateToken(user);

    return res.status(200).json({
      message: "SignIn successful",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Google Sign-In failed",
      error: error.message,
    });
  }
};

const getUserInfo = async (req, res) => {
  const userId = req?.userId;
  try {
    if (!userId) {
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Unauthorized user!!" });
    }

    const userData = await User.findById(userId).select("-password");

    if (!userData) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "User not found" });
    }

    return res.status(HttpStatusCode.Ok).json({ user: userData });
  } catch (error) {
    console.log(error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Internal server error", error });
  }
};

const updateUser = async (req, res) => {
  const userId = req?.userId;

  try {
    if (!userId) {
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Unauthorized user!!" });
    }

    const { username, firstName, lastName, university } = req.body;

    
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "User not found!" });
    }


    if (username != null && username !== user.username) {
      const usernameAvailability = await User.findOne({ username: username });
      if (usernameAvailability) {
        return res.status(409).json({ message: "Username already in use." });
      }

      const documents = await Upload.find({ uploadedBy: userId });

      if (documents.length > 0) {
        documents.forEach(async (document) => {
          document.username = username;
          await document.save();
        });
      }

      user.username = username;
    }

    if (firstName) {
      user.firstName = firstName;
    }
    if (lastName) {
      user.lastName = lastName;
    }

    if (university) {
      user.university = university;
    }

    await user.save();

    return res
      .status(HttpStatusCode.Ok)
      .json({ user: user, message: "Account updated successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "An error occurred while updating the profile." });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const userId = req?.userId;
    if (!userId) {
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "User not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "User not found!" });
    }

    const isPasswordMatched = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordMatched) {
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Invalid current password" });
    }

    user.password = newPassword;

    await user.save();

    return res
      .status(HttpStatusCode.Ok)
      .json({ user: user, message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "An error occurred while updating the password." });
  }
};

const uploadDocumentToCloudinary = async (file) => {
  try {
    const responseLink = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          public_id: file.originalname,
          filename_override: file.originalname,
          use_filename: false,
          unique_filename: false,
        },
        (error, result) => {
          if (error) {
            console.error(`Error uploading file: ${error.message}`);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(file.buffer);
    });

    return responseLink;
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    return null;
  }
};

const userDocumentUpload = async (req, res) => {
  const userId = req?.userId;
  const {
    title,
    category,
    university,
    course,
    session,
    description,
    fileType,
  } = req.body;
  const file = req.file;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "User not found" });
    }

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!category || !university || !course || !session || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const responseLink = await uploadDocumentToCloudinary(file);
    if (!responseLink) {
      return res
        .status(HttpStatusCode.InternalServerError)
        .json({ message: "Error uploading file" });
    }

    const document = new Upload({
      url: responseLink.secure_url,
      title,
      category,
      university,
      course,
      session,
      description,
      fileType,
      uploadedBy: userId,
      username: user.username,
    });

    await document.save();
    user.uploads.push(document._id);
    await user.save();

    return res.status(201).json({ message: "File Uploaded", document });
  } catch (error) {
    console.error(error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Internal server error", error });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "User not found" });
    }

    const isVerifiedUser = user.emailVerified;

    if (!isVerifiedUser) {
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Email not verified" });
    }

    await sendForgotPasswordMail(user);

    return res
      .status(HttpStatusCode.Ok)
      .json({ message: "Verification email sent!" });
  } catch (error) {
    console.error("Error during forget password:", error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Oops Something went wrong!" || error.message });
  }
};

const verifyForgetPasswordMail = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "User not found" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded) {
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Invalid token" });
    }

    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.redirect(
      `${process.env.CLIENT_URL}/reset-password?token=${verificationToken}`
    );
  } catch (error) {
    console.error(error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Oops somthing went wrong" || error.message });
  }
};

const resetPassword = async (req, res) => {
  const userId = req?.userId;
  const { newPassword } = req.body;
  try {
    if (!userId) {
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Unauthorized user!!" });
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(HttpStatusCode.NotFound).json({ message: "User not found" });
    }

    user.password = newPassword;

    await user.save();

    res
      .status(HttpStatusCode.Ok)
      .json({ message: "Password reset successful" });
  } catch (error) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Oops something went wrong!" || error.message });
  }
};

module.exports = {
  signup,
  verifyMail,
  googleSignin,
  newGoogleSignin,
  signin,
  getUserInfo,
  updateUser,
  updateUserPassword,
  userDocumentUpload,
  forgetPassword,
  verifyForgetPasswordMail,
  resetPassword,
};

const cloudinary = require("../config/cloudnaryConfig");
const Chat = require("../models/userDoubt");
const User = require("../models/userModel");
const Upload = require("../models/userUpload");
const generateToken = require("../utils/generateToken");
const sendVerificationMail = require("../utils/sendVerificationMail");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { username, firstName, lastName, email, password } = req.body;

    if (!username || !firstName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ message: "Username already in use" });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ message: "Email already in use" });
      }
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
      .status(201)
      .json({ message: "Verification email sent to your email" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyMail = async (req, res) => {
  const { id, token } = req.params;

  try {
    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    user.emailVerified = true;
    await user.save();

    setTimeout(() => {
      res.redirect("http://localhost:5173/login");
    }, 2000);
  } catch (error) {
    return res
      .status(500)
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
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const token = generateToken(user);
    res.status(200).json({
      message: "Signin Successful",
      token: token,
    });
  } catch (error) {
    console.error("Error during signin:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const userData = req.user;
    if (!userData) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const fetchUserDoubts = async (req, res) => {
  const { userId } = req.params;

  try {
    const userChats = await Chat.find({ user: userId }).sort({ createdAt: -1 });

    if (!userChats || userChats.length === 0) {
      return res
        .status(404)
        .json({ message: "No chat history found for this user." });
    }

    res.status(200).json(userChats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chat history." });
  }
};

// const getUserDetailsById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await User.findById(id).select("-password");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     return res.status(200).json({ user });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Internal server error", error });
//   }
// };

const getUserDetailsByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username: username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const updateUser = async (req, res) => {
  try {
    const userData = req.user;
    if (!userData) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { id } = req.params;
    const { username, firstName, lastName } = req.body;

    // Check if user exists
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Check if the username is provided and different
    if (username != null && username !== user.username) {
      const usernameAvailability = await User.findOne({ username: username });
      if (usernameAvailability) {
        return res.status(409).json({ message: "Username already in use." });
      }
      user.username = username;
    }

    // Update other fields if provided
    if (firstName) {
      user.firstName = firstName;
    }
    if (lastName) {
      user.lastName = lastName;
    }

    // Save updated user data
    await user.save();

    return res
      .status(200)
      .json({ user: user, message: "Account updated successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the profile." });
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
  const { id } = req.params;
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
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!category || !university || !course || !session || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const responseLink = await uploadDocumentToCloudinary(file);
    if (!responseLink) {
      return res.status(500).json({ message: "Error uploading file" });
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
      uploadedBy: id,
      username: user.username,
    });

    await document.save();
    user.uploads.push(document._id);
    await user.save();

    return res.status(201).json({ message: "File Uploaded", document });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const fetchUserUploads = async (req, res) => {
  const { userId } = req.params;

  try {
    const documents = await Upload.find({ uploadedBy: userId });

    if (!documents || documents.length === 0) {
      return res
        .status(404)
        .json({ message: "No documents found for this user" });
    }

    return res.status(200).json(documents);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

// const fetchSolutionFromAPI = async (question) => {
//   const url = "https://open-ai21.p.rapidapi.com/conversationgpt35";
//   const options = {
//     method: "POST",
//     headers: {
//       "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
//       "x-rapidapi-host": "open-ai21.p.rapidapi.com",
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       messages: [
//         {
//           role: "user",
//           content: question,
//         },
//       ],
//       web_access: false,
//       system_prompt: "",
//       temperature: 0.9,
//       top_k: 5,
//       top_p: 0.9,
//       max_tokens: 256,
//     }),
//   };
//   const response = await fetch(url, options);
//   const result = await response.text();
//   return result;
// };

// const userDoubtSolver = async (req, res) => {
//   const { userId } = req.params;
//   const { question } = req.body;

//   try {

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found in doubt" });
//     }

//     let chat = await Chat.findOne({ user: userId, question });
//     if (!chat) {
//       chat = new Chat({ user: userId, question });
//     }

//     const answer = await fetchSolutionFromAPI(question);
//     chat.answer = answer;
//     await chat.save();

//     return res.status(200).json({ message: "Doubt solved", chat });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error", error });
//   }
// };

module.exports = {
  signup,
  verifyMail,
  signin,
  getUserDetails,
  fetchUserDoubts,
  // getUserDetailsById,
  getUserDetailsByUsername,
  updateUser,
  userDocumentUpload,
  fetchUserUploads,
};

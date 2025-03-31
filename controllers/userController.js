const Chat = require("../models/userDoubt");
const User = require("../models/userModel");
const Upload = require("../models/userUpload");

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

const getUserDetailsById = async (req, res) => {
  try {
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

const updateUserStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, { active_status: isOnline });
  } catch (error) {
    console.error("Error updating user status:", error);
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
  fetchUserDoubts,
  getUserDetailsById,
  getUserDetailsByUsername,
  fetchUserUploads,
  updateUserStatus,
};

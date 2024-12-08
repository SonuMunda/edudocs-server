const Upload = require("../models/userUpload");

const fetchAllDocuments = async (req, res) => {
  try {
    const documents = await Upload.find({});
    return res.status(200).json({ documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fetchFileDetailsById = async (req, res) => {
  const { fileId } = req.params;

  try {
    const details = await Upload.findById({ _id: fileId });

    if (!details) {
      return res.status(404).json({ message: "File not found" });
    }

    return res.status(200).json({ data: details });
  } catch (error) {
    console.error(error);
  }
};

const addLike = async (req, res) => {
  const { uploadId, userId } = req.params;


  try {
    const upload = await Upload.findById(uploadId);

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    if (upload.likes.includes(userId)) {
      return res.status(400).json({ message: "Already liked" });
    }

    upload.likes.push(userId);
    await upload.save();

    return res.status(200).json({ message: "You liked document" });
  } catch (error) {
    console.error("Error adding like:", error);
    return res.status(500).json({ message: "Error adding like" });
  }
};

const addVote = async (req, res) => {
  const { uploadId, userId } = req.params;

  try {
    const upload = await Upload.findById(uploadId);

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    if (upload.votes.includes(userId)) {
      return res.status(400).json({ message: "Already voted" });
    }

    upload.votes.push(userId);
    await upload.save();

    return res.status(200).json({ message: "Voted successfully" });
  } catch (error) {
    console.error("Error adding vote:", error);
    return res.status(500).json({ message: "Error adding vote" });
  }
};

module.exports = { fetchAllDocuments, fetchFileDetailsById, addLike, addVote };

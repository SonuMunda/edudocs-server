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

const toggleLike = async (req, res) => {
  const { uploadId, userId } = req.params;

  try {
    const upload = await Upload.findById(uploadId);
    if (!upload) return res.status(404).json({ message: "Upload not found" });

    const hasLiked = upload.likes.includes(userId);
    const updateOperation = hasLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updatedUpload = await Upload.findByIdAndUpdate(
      uploadId,
      updateOperation,
      { new: true }
    ).lean();

    if (req.io) {
      req.io.to(uploadId).emit("likeUpdate", {
        documentId: uploadId,
        likes: updatedUpload.likes,
        likesCount: updatedUpload.likes.length,
      });
    }

    return res.status(200).json({
      likes: updatedUpload.likes,
      likesCount: updatedUpload.likes.length,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ message: "Error toggling like" });
  }
};

const toggleVote = async (req, res) => {
  const { uploadId, userId } = req.params;

  try {
    const upload = await Upload.findById(uploadId);
    if (!upload) return res.status(404).json({ message: "Upload not found" });

    const hasVoted = upload.votes.includes(userId);
    const updateOperation = hasVoted
      ? { $pull: { votes: userId } }
      : { $addToSet: { votes: userId } };

    const updatedUpload = await Upload.findByIdAndUpdate(
      uploadId,
      updateOperation,
      { new: true }
    ).lean();

    if (req.io) {
      req.io.to(uploadId).emit("voteUpdate", {
        documentId: uploadId,
        votes: updatedUpload.votes,
        votesCount: updatedUpload.votes.length,
      });
    }

    return res.status(200).json({
      votes: updatedUpload.votes,
      votesCount: updatedUpload.votes.length,
    });
  } catch (error) {
    console.error("Error toggling vote:", error);
    return res.status(500).json({ message: "Error toggling vote" });
  }
};

module.exports = {
  fetchAllDocuments,
  fetchFileDetailsById,
  toggleLike,
  toggleVote,
};

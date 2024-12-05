const mongoose = require("mongoose");
const { Schema } = mongoose;

const uploadSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  university: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  session: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: false,
  },
  votes: {
    type: Number,
    required: false,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const Upload = mongoose.model("Upload", uploadSchema);
module.exports = Upload;

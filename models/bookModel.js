const { Schema } = require("mongoose");

const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
    required: true,
  },
  url: {
    type: Number,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now(),
  },
  category: {
    type: String,
    required: true,
  },
});

const bookModel = mongoose.model("Book", bookSchema);

module.exports = bookModel;

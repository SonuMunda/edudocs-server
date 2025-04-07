const { Schema, model } = require("mongoose");

const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    required: true,
  },
});

const bookModel = model("Book", bookSchema);

module.exports = bookModel;

const Books = require("../models/bookModel");

const fetchBooks = async (req, res) => {
  try {
    const books = await Books.find();
    if (!books || books.length === 0) {
      return res.status(404).json({ message: "No books found" });
    }

    res.status(200).json({ message: "Books fetched successfully", books });
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error });
  }
};
const fetchBookById = async (req, res) => {
  const { bookId } = req.params;
  try {
    const bookInfo = await Books.findById(bookId);
    if (!bookInfo) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book fetched successfully", bookInfo });
  } catch (error) {
    res.status(500).json({ message: "Error fetching book", error });
  }
};

module.exports = { fetchBooks, fetchBookById };

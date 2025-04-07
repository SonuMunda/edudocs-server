const express = require("express");
const router = express.Router();

const { fetchBooks, fetchBookById } = require("../controllers/booksController");

router.get("/", fetchBooks);
router.get("/book/:bookId", fetchBookById);

module.exports = router;

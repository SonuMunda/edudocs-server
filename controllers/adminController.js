const { HttpStatusCode } = require("axios");
const User = require("../models/userModel");
const Uploads = require("../models/userUpload");
const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudnaryConfig");
const Book = require("../models/bookModel");

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email });

    if (!admin) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "This email is not recoganized as EduDocs Admin!" });
    }

    const isPasswordMatched = await admin.comparePassword(password);

    if (!isPasswordMatched) {
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Invalid Credentials!" });
    }

    const secretKey = process.env.SECRET_KEY;
    const token = jwt.sign(
      {
        userId: admin._id,
        role: admin.role,
      },
      secretKey,
      {
        expiresIn: "1hr",
      }
    );
    return res.status(HttpStatusCode.Ok).json({ token: token });
  } catch (error) {
    return res
      .status(HttpStatusCode.InternalServerError)
      .json(error.message || "Internal server error");
  }
};

const fetchAdminDetails = async (req, res) => {
  const userId = req?.userId;
  try {
    if (!userId) {
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Unauthorized Signin" });
    }

    const admin = await Admin.findById(userId).select("-password");

    return res
      .status(HttpStatusCode.Ok)
      .json({ message: "Data fetched Successfully", admin: admin });
  } catch (error) {
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const admins = await Admin.find().select("-password");
    const documents = await Uploads.find();
    const books = await Book.find();
    const data = {
      admins,
      users,
      documents,
      books,
    };
    return res.status(HttpStatusCode.Ok).json({ data });
  } catch (error) {
    return res.status(HttpStatusCode.BadRequest).json({ error: error.message });
  }
};

const uploadToCloudinary = async (file) => {
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

const bookUpload = async (req, res) => {
  try {
    const { title, author, book, category } = req.body;

    if (!title || !author || !book || !category) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Please upload book cover" });
    }

    const cover = await uploadToCloudinary(file);

    if (!cover) {
      return res.status(400).json({ message: "Error uploading cover" });
    }

    const bookData = {
      title,
      author,
      category,
      cover: cover.secure_url,
      url: book,
    };

    const newBook = await new Book(bookData);
    if (!newBook) {
      return res.status(400).json({ message: "Error creating book" });
    }
    await newBook.save();

    return res.status(201).json({ message: "Book uploaded successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { signin, fetchAdminDetails, getDashboardData, bookUpload };

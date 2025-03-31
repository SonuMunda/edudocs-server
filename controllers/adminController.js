const { HttpStatusCode } = require("axios");
const User = require("../models/userModel");
const Uploads = require("../models/userUpload");
const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const uploadToCloudinary = require("../utils/uploadToCloudnary");

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
    const data = {
      admins,
      users,
      documents,
    };
    return res.status(HttpStatusCode.Ok).json({ data });
  } catch (error) {
    return res.status(HttpStatusCode.BadRequest).json({ error: error.message });
  }
};

const bookUpload = async (req, res) => {
  try {
    const { title, author, description, category } = req.body;
    const file = req.file;


    console.log(file);

    // if (!file) {
    //   return res
    //     .status(HttpStatusCode.BadRequest)
    //     .json({ message: "Please upload a file" });
    // }
    

    // if (!title || !author || !description || !cover || !category) {
    //   return res
    //     .status(HttpStatusCode.BadRequest)
    //     .json({ message: "Please fill all the fields" });
    // }

    // const responseLink = await uploadToCloudinary(file);

    // if (!responseLink) {
    //   return res
    //     .status(HttpStatusCode.InternalServerError)
    //     .json({ message: "Error uploading file" });
    // }

    // const document = new Uploads({
    //   title,
    //   author,
    //   description,
    //   cover: responseLink.secure_url,
    //   url: responseLink.secure_url,
    //   category,
    // });

    // await document.save();

    // return res
    //   .status(HttpStatusCode.Created)
    //   .json({ message: "Document uploaded successfully" });
  } catch (error) {
    return res.status(HttpStatusCode.BadRequest).json({ error: error.message });
  }
};

module.exports = { signin, fetchAdminDetails, getDashboardData, bookUpload };

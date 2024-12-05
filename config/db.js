const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const URI = process.env.DB_URI;
    mongoose.connect(URI);
    console.log("Database Connected Successfully !");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDatabase;
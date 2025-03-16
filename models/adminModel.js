const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new Schema({
  fullname: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  profileImage: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "admin",
  },
});

adminSchema.methods.comparePassword = async function (password) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
  } catch (error) {
    throw error;
  }
};

const Admin = model("Admin", adminSchema);
module.exports = Admin;

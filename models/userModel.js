const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  university: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  role: {
    type: String,
    default: "student",
  },
  source: {
    type: String,
  },
  active_status: {
    type: Boolean,
    default: false,
  },
  uploads: [{ type: Schema.Types.ObjectId, ref: "Upload" }],
});

// Method to generate hashed password
userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  try {
    const saltRounds = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(user.password, saltRounds);
    user.password = hash_password;
  } catch (error) {
    return next(error);
  }
});

//Password match function
userSchema.methods.comparePassword = async function (password) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
  } catch (error) {
    throw error;
  }
};

// Create and export the model
const User = mongoose.model("User", userSchema);
module.exports = User;

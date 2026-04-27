const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 5,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minLength: 5,
    },
    age: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;

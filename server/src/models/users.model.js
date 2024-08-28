const { Schema, model } = require("mongoose");

const usersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar:{
      type: String
    },
    posts:{
      type: Number,
      default: 0,
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("User", usersSchema);

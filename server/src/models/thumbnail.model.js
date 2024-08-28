const { Schema, model, models } = require("mongoose");

const thumbnailSchema = new Schema(
  {
    thumbnail: {
      type: String,
    },
    name: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("Thumbnail", thumbnailSchema);

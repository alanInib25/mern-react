const { Schema, model } = require("mongoose");

const thumbnailSchema = new Schema(
  {
    thumbnail: {
      type: String,
    },
    name: {
      type: String,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("Thumbnail", thumbnailSchema);

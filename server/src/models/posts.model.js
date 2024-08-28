const { model, Schema } = require("mongoose");

const postsSchema = new Schema(
  {
    description: {
      type: String,
      require: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    thumbnail: {
      type: Schema.Types.ObjectId,
      ref: "Thumbnail",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model("Post", postsSchema);

const { model, Schema } = require("mongoose");

const pngImageSchema = new Schema(
  {
    image_url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("png_images", pngImageSchema);

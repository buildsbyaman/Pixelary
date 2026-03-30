const mongoose = require("mongoose");

const shotSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    }],
  },
  {
    timestamps: true,
  }
);

// Virtual getter: returns first image for backward compatibility (thumbnails etc.)
shotSchema.virtual("thumbnail").get(function () {
  if (this.images && this.images.length > 0) {
    return this.images[0];
  }
  return this.image || "";
});

const Shot = mongoose.model("Shot", shotSchema);

module.exports = Shot;

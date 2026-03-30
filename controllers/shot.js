const Shot = require("../models/shot.js");
const cloudinary = require("cloudinary").v2;
const CustomError = require("../utilities/CustomError.js");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const extractPublicId = (url) => {
  const parts = url.split("/");
  const last = parts[parts.length - 1];
  return last.substring(0, last.lastIndexOf("."));
};

// Upload a single file buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "Pixelary",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 2000, height: 2000, crop: "limit" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
};

// Clean up Cloudinary uploads that already succeeded (used when a later step fails)
const cleanupCloudinaryUploads = async (uploadResults) => {
  for (const result of uploadResults) {
    try {
      await cloudinary.uploader.destroy(result.public_id);
    } catch (err) {
      console.error("Failed to cleanup uploaded image:", err);
    }
  }
};

module.exports.indexShow = async (req, res, next) => {
  try {
    const shotData = await Shot.find().populate("author");

    let userLikes = [];

    if (req.user) {
      const User = require("../models/user.js");
      const user = await User.findById(req.user._id);
      if (user) {
        userLikes = user.shotsLiked.map((id) => id.toString());
      }
    }

    res.render("shots/index.ejs", {
      shotData,
      userLikes,
      cssFiles: [
        "/css/common.css",
        "/css/header.css",
        "/css/footer.css",
        "/css/home.css",
      ],
    });
  } catch (error) {
    console.error("Error fetching shots:", error);
    next(new CustomError(500, "Internal server Error"));
  }
};

module.exports.newShow = (req, res) => {
  res.render("shots/new.ejs", {
    cssFiles: [
      "/css/common.css",
      "/css/header.css",
      "/css/footer.css",
      "/css/auth.css",
    ],
  });
};

module.exports.individualShow = async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    req.flash("failure", "Invalid shot ID format!");
    return res.redirect("/shot");
  }

  try {
    const shot = await Shot.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true },
    )
      .populate("author")
      .populate({
        path: "reviews",
        populate: { path: "owner" },
      });

    if (!shot) {
      req.flash("failure", "No shot found with this ID!");
      return res.redirect("/shot");
    }

    let isLiked = false;
    if (req.user) {
      const User = require("../models/user.js");
      const user = await User.findById(req.user._id);
      if (user) {
        isLiked = user.shotsLiked.includes(id);
      }
    }

    res.render("shots/show.ejs", {
      shot,
      isLiked,
      cssFiles: [
        "/css/common.css",
        "/css/header.css",
        "/css/footer.css",
        "/css/shot-detail.css",
      ],
    });
  } catch (error) {
    console.error("Error fetching shot:", error);
    req.flash("failure", "Error loading shot!");
    res.redirect("/shot");
  }
};

module.exports.new = async (req, res) => {
  // Track uploads so we can clean up if something fails after partial upload
  const uploadResults = [];
  try {
    if (!req.files || req.files.length === 0) {
      req.flash("failure", "Please upload at least one image for your shot.");
      return res.redirect("/shot/new");
    }

    // All validation has already passed (Joi middleware ran before this).
    // NOW we upload to Cloudinary.
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer);
      uploadResults.push(result);
    }
    const imageUrls = uploadResults.map((r) => r.secure_url);

    const { title, description, tags } = req.body.shot;
    const newShot = new Shot({
      title,
      description: description,
      image: imageUrls[0],
      images: imageUrls,
      tags: tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
      author: res.locals.currUser.id,
    });
    await newShot.save();
    req.flash("success", "Shot created successfully!");
    res.redirect(`/shot/${newShot.id}`);
  } catch (error) {
    console.error("Error creating shot:", error);
    // Clean up any images that were uploaded to Cloudinary before the error
    await cleanupCloudinaryUploads(uploadResults);
    req.flash("failure", "Unable to create shot.");
    res.redirect("/shot/new");
  }
};

module.exports.editShow = async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    req.flash("failure", "Invalid shot ID format!");
    return res.redirect("/shot");
  }

  try {
    const shot = await Shot.findById(id).populate("author");
    if (!shot) {
      req.flash("failure", "Shot not found!");
      return res.redirect("/shot");
    }
    if (res.locals.currUser.id == shot.author.id) {
      res.render("shots/edit.ejs", {
        shot,
        cssFiles: [
          "/css/common.css",
          "/css/header.css",
          "/css/footer.css",
          "/css/auth.css",
        ],
      });
    } else {
      req.flash("failure", "You don't own this shot!");
      res.redirect("/shot");
    }
  } catch (error) {
    console.error("Error fetching shot for edit:", error);
    req.flash("failure", "Error loading shot!");
    res.redirect("/shot");
  }
};

module.exports.edit = async (req, res) => {
  const { id } = req.params;
  const uploadResults = [];

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    req.flash("failure", "Invalid shot ID format!");
    return res.redirect("/shot");
  }

  try {
    const oldShot = await Shot.findById(id);
    if (!oldShot) {
      req.flash("failure", "Shot not found!");
      return res.redirect("/shot");
    }
    if (res.locals.currUser.id == oldShot.author._id) {
      // Keep existing images by default
      let images =
        oldShot.images && oldShot.images.length > 0
          ? [...oldShot.images]
          : oldShot.image
            ? [oldShot.image]
            : [];
      let oldImages = [...images]; // Save a copy for cleanup after successful update

      // If new files uploaded, upload to Cloudinary first
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.buffer);
          uploadResults.push(result);
        }
        images = uploadResults.map((r) => r.secure_url);
      }

      const { title, description, tags } = req.body.shot;
      await Shot.findByIdAndUpdate(
        id,
        {
          title,
          image: images[0] || "",
          images: images,
          description,
          tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        },
        { new: true },
      );

      // DB update succeeded — now safe to delete old images from Cloudinary
      if (req.files && req.files.length > 0) {
        for (const oldUrl of oldImages) {
          const publicId = extractPublicId(oldUrl);
          await cloudinary.uploader.destroy(`Pixelary/${publicId}`);
        }
      }

      req.flash("success", "Shot updated successfully!");
      res.redirect(`/shot/${id}`);
    } else {
      req.flash("failure", "You don't own this shot!");
      res.redirect("/shot");
    }
  } catch (error) {
    console.error("Error updating shot:", error);
    // Clean up any newly uploaded images since the update failed
    await cleanupCloudinaryUploads(uploadResults);
    req.flash("failure", "Error updating shot!");
    res.redirect("/shot");
  }
};

module.exports.delete = async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    req.flash("failure", "Invalid shot ID format!");
    return res.redirect("/shot");
  }

  try {
    const oldShot = await Shot.findById(id).populate("author");
    if (!oldShot) {
      req.flash("failure", "Shot not found!");
      return res.redirect("/shot");
    }
    if (res.locals.currUser._id.equals(oldShot.author._id)) {
      // Delete all images from Cloudinary
      const allImages =
        oldShot.images && oldShot.images.length > 0
          ? oldShot.images
          : oldShot.image
            ? [oldShot.image]
            : [];

      for (const imgUrl of allImages) {
        const publicId = extractPublicId(imgUrl);
        await cloudinary.uploader.destroy(`Pixelary/${publicId}`);
      }

      await Shot.findByIdAndDelete(id);
      req.flash(
        "success",
        "Your shot has been successfully removed from Pixelary.",
      );
      req.session.save(() => {
        res.redirect("/shot");
      });
    } else {
      req.flash("failure", "You don't own this shot!");
      res.redirect("/shot");
    }
  } catch (error) {
    console.error("Error deleting shot:", error);
    req.flash("failure", "Error deleting shot!");
    res.redirect("/shot");
  }
};

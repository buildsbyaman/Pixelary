const Shot = require("../models/shot.js");
const cloudinary = require("cloudinary").v2;
const CustomError = require("../utilities/CustomError.js");

const extractPublicId = (url) => {
  const parts = url.split("/");
  const last = parts[parts.length - 1];
  return last.substring(0, last.lastIndexOf("."));
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
      { new: true }
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
  try {
    if (!req.file || !req.file.path) {
      req.flash("failure", "Please upload an image for your shot.");
      return res.redirect("/shot/new");
    }
    const { title, description, tags } = req.body.shot;
    const newShot = new Shot({
      title,
      description: description,
      image: req.file.path,
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
      let image = oldShot.image;
      if (req.file && req.file.path) {
        const publicId = extractPublicId(oldShot.image);
        await cloudinary.uploader.destroy(`Pixelary/${publicId}`);
        image = req.file.path;
      }
      const { title, description, tags } = req.body.shot;
      await Shot.findByIdAndUpdate(
        id,
        {
          title,
          image,
          description,
          tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        },
        { new: true }
      );
      req.flash("success", "Shot updated successfully!");
      res.redirect(`/shot/${id}`);
    } else {
      req.flash("failure", "You don't own this shot!");
      res.redirect("/shot");
    }
  } catch (error) {
    console.error("Error updating shot:", error);
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
    if (res.locals.currUser.id == oldShot.author._id) {
      const publicId = extractPublicId(oldShot.image);
      await cloudinary.uploader.destroy(`Pixelary/${publicId}`);
      await Shot.findByIdAndDelete(id);
      req.flash("success", "Shot deleted successfully!");
      res.redirect("/shot");
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

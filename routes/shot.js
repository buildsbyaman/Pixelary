const express = require("express");
const { isLoggedIn } = require("../middleware");
const { shotSchema } = require("../model.js");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const statRouter = require("./stat.js");
const shotController = require("../controllers/shot.js");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Pixelary",
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 2000, height: 2000, crop: "limit" }],
  },
});

const shotSchemaValidatorForNew = (req, res, next) => {
  const { error } = shotSchema.validate(req.body.shot);
  if (error) {
    req.flash("failure", error.message);
    res.redirect("/shot/new");
  } else {
    next();
  }
};

const shotSchemaValidatorForUpdate = (req, res, next) => {
  const { error } = shotSchema.validate(req.body.shot);
  if (error) {
    req.flash("failure", error.message);
    res.redirect(`/shot/${req.params.id}/edit`);
  } else {
    next();
  }
};

const upload = multer({ storage: storage });

router.get("/", shotController.indexShow);

router.get("/new", isLoggedIn, shotController.newShow);

router.get("/:id", shotController.individualShow);

router.post(
  "/",
  isLoggedIn,
  upload.single("shot[image]"),
  shotSchemaValidatorForNew,
  shotController.new
);

router.get("/:id/edit", isLoggedIn, shotController.editShow);

router.put(
  "/:id",
  isLoggedIn,
  upload.single("shot[image]"),
  shotSchemaValidatorForUpdate,
  shotController.edit
);

router.use("/:id/stat", statRouter);

router.delete("/:id", isLoggedIn, shotController.delete);

module.exports = router;

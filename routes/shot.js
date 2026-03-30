const express = require("express");
const { isLoggedIn } = require("../middleware");
const { shotSchema } = require("../model.js");
const router = express.Router();
const multer = require("multer");
const statRouter = require("./stat.js");
const shotController = require("../controllers/shot.js");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed."), false);
    }
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

router.get("/", shotController.indexShow);

router.get("/new", isLoggedIn, shotController.newShow);

router.get("/:id", shotController.individualShow);

router.post(
  "/",
  isLoggedIn,
  upload.array("shot[images]", 10),
  shotSchemaValidatorForNew,
  shotController.new,
);

router.get("/:id/edit", isLoggedIn, shotController.editShow);

router.put(
  "/:id",
  isLoggedIn,
  upload.array("shot[images]", 10),
  shotSchemaValidatorForUpdate,
  shotController.edit,
);

router.use("/:id/stat", statRouter);

router.delete("/:id", isLoggedIn, shotController.delete);

module.exports = router;

const express = require("express");
const router = express.Router();
const CustomError = require("../utilities/CustomError.js");
const passport = require("passport");
const { userSchema } = require("../model.js");
const { isLoggedIn, isNotLoggedIn } = require("../middleware.js");
const userController = require("../controllers/user.js");

const validateUserSchema = (req, res, next) => {
  const { error } = userSchema.validate(req.body.user);
  if (error) {
    req.flash("failure", error.message);
    res.redirect("/user/signup");
  } else {
    next();
  }
};

router.get("/forgot", isNotLoggedIn, userController.forgotShow);

router.get("/verify-otp", isNotLoggedIn, userController.verifyOTPShow);

router.get("/reset-password", isNotLoggedIn, userController.resetPasswordShow);

router.get("/signup", isNotLoggedIn, userController.signupShow);

router.get("/login", isNotLoggedIn, userController.loginShow);

router.post("/signup", validateUserSchema, userController.signup);

router.post("/forgot", userController.forgotPassword);

router.post("/verify-otp", userController.verifyOTP);

router.get("/resend-otp", isNotLoggedIn, userController.resendOTP);

router.post("/reset-password", userController.resetPassword);

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: { type: "failure", message: "Invalid username or password." },
    failureRedirect: "/user/login",
  }),
  userController.login
);

router.get("/edit", isLoggedIn, userController.editShow);

router.put("/", isLoggedIn, userController.edit);

router.delete("/", isLoggedIn, userController.delete);

router.post("/login-required", (req, res) => {
  req.flash("failure", "Please log in to like shots!");
  res.json({ success: true });
});

router.get("/logout", isLoggedIn, userController.logout);

router.get("/", isLoggedIn, (req, res) => {
  res.redirect(`/user/${req.user._id}`);
});

router.get("/:id", userController.profileShow);

module.exports = router;

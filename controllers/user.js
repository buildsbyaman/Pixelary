const User = require("../models/user.js");
const Shot = require("../models/shot.js");
const crypto = require("crypto");
const {
  sendOTPEmail,
  sendWelcomeEmail,
} = require("../utilities/verficationEmail.js");

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

module.exports.signupShow = (req, res) => {
  res.render("users/signup.ejs", {
    cssFiles: [
      "/css/common.css",
      "/css/header.css",
      "/css/footer.css",
      "/css/auth.css",
    ],
  });
};

module.exports.loginShow = (req, res) => {
  res.render("users/login.ejs", {
    cssFiles: [
      "/css/common.css",
      "/css/header.css",
      "/css/footer.css",
      "/css/auth.css",
    ],
  });
};

module.exports.forgotShow = (req, res) => {
  res.render("users/forgot.ejs", {
    cssFiles: [
      "/css/common.css",
      "/css/header.css",
      "/css/footer.css",
      "/css/auth.css",
    ],
  });
};

module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      req.flash("failure", "Email address is required.");
      return res.redirect("/user/forgot");
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      req.flash("failure", "Please enter a valid email address.");
      return res.redirect("/user/forgot");
    }

    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      req.flash(
        "success",
        "If an account with that email exists, we've sent an OTP to your email."
      );
      req.session.resetEmail = trimmedEmail;
      return res.redirect("/user/verify-otp");
    }

    const otp = generateOTP();
    user.verificationToken = otp;
    user.verificationTokenExpires = Date.now() + 10 * 60 * 1000;
    const verficationAttemptsMade = user.verificationAttempts;
    user.verificationAttempts = verficationAttemptsMade + 1;
    await user.save();

    await sendOTPEmail(trimmedEmail, otp);

    req.flash("success", "OTP has been sent to your email address.");
    req.session.resetEmail = trimmedEmail;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect("/user/forgot");
      }
      res.redirect("/user/verify-otp");
    });
  } catch (error) {
    console.log(error);
    req.flash("failure", "Unable to process reset request. Please try again.");
    res.redirect("/user/forgot");
  }
};

module.exports.verifyOTPShow = (req, res) => {
  const email = req.session.signupEmail || req.session.resetEmail || "";
  res.render("users/verify-otp.ejs", {
    cssFiles: [
      "/css/common.css",
      "/css/header.css",
      "/css/footer.css",
      "/css/auth.css",
    ],
    email: email,
  });
};

module.exports.resetPasswordShow = (req, res) => {
  const email = req.session.resetEmail;

  if (!email) {
    req.flash("failure", "Invalid reset session. Please start over.");
    return res.redirect("/user/forgot");
  }

  res.render("users/reset-password.ejs", {
    cssFiles: [
      "/css/common.css",
      "/css/header.css",
      "/css/footer.css",
      "/css/auth.css",
    ],
    email: email,
  });
};

module.exports.resendOTP = async (req, res) => {
  try {
    const email = req.session.signupEmail || req.session.resetEmail;

    if (!email) {
      req.flash("failure", "Session expired. Please start over.");
      return res.redirect("/user/signup");
    }

    const trimmedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      req.flash("failure", "User not found. Please sign up again.");
      return res.redirect("/user/signup");
    }

    if (user.verificationAttempts >= 5) {
      req.flash(
        "failure",
        "Your account has been temporarily blocked due to multiple failed attempts. Please try again later or contact support."
      );
      return res.redirect("/shot");
    }

    const otp = generateOTP();
    user.verificationToken = otp;
    user.verificationTokenExpires = Date.now() + 10 * 60 * 1000;
    const verificationAttemptsMade = user.verificationAttempts;
    user.verificationAttempts = verificationAttemptsMade + 1;
    await user.save();

    await sendOTPEmail(trimmedEmail, otp);

    req.flash("success", "A new OTP has been sent to your email address.");
    res.redirect("/user/verify-otp");
  } catch (error) {
    console.log(error);
    req.flash("failure", "Unable to resend OTP. Please try again.");
    res.redirect("/user/verify-otp");
  }
};

module.exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      req.flash("failure", "Email and OTP are required.");
      return res.redirect("/user/verify-otp");
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOTP = otp.trim();

    const user = await User.findOne({
      email: trimmedEmail,
      verificationToken: trimmedOTP,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("failure", "Invalid or expired OTP. Please try again.");
      req.session.resetEmail = trimmedEmail;
      return res.redirect("/user/verify-otp");
    }

    if (user.verificationAttempts >= 5) {
      req.flash(
        "failure",
        "Your account has been temporarily blocked due to multiple failed attempts. Please try again later or contact support."
      );
      return res.redirect("/shot");
    }

    if (!user.isVerified) {
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      user.verificationAttempts = 0;
      await user.save();

      await sendWelcomeEmail(trimmedEmail);

      req.login(user, (error) => {
        if (error) {
          req.flash(
            "failure",
            "Unable to authenticate you. Please login manually!"
          );
          return res.redirect("/user/login");
        }
        req.flash("success", "Welcome to Pixelary!");
        res.redirect("/shot");
      });
      return;
    }

    user.verificationTokenExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    req.flash(
      "success",
      "OTP verified successfully! Please set your new password."
    );
    req.session.resetEmail = trimmedEmail;
    res.redirect("/user/reset-password");
  } catch (error) {
    console.log(error);
    req.flash("failure", "Unable to verify OTP. Please try again.");
    req.session.resetEmail = undefined;
    res.redirect("/user/forgot");
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      req.flash("failure", "All fields are required.");
      return res.redirect("/user/forgot");
    }

    if (password !== confirmPassword) {
      req.flash("failure", "Passwords do not match.");
      return res.redirect("/user/reset-password");
    }

    if (password.length < 6) {
      req.flash("failure", "Password must be at least 6 characters long.");
      return res.redirect("/user/reset-password");
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash(
        "failure",
        "Invalid or expired reset token. Please start over."
      );
      return res.redirect("/user/forgot");
    }

    await user.setPassword(password);

    user.verificationToken = null;
    user.verificationTokenExpires = null;
    user.verificationAttempts = 0;

    await user.save();

    req.session.resetEmail = undefined;

    req.flash(
      "success",
      "Password reset successfully! Please log in with your new password."
    );
    res.redirect("/user/login");
  } catch (error) {
    console.log(error);
    req.flash("failure", "Unable to reset password. Please try again.");
    req.session.resetEmail = undefined;
    res.redirect("/user/forgot");
  }
};

module.exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body.user;
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      req.flash("failure", "Please enter a valid email address.");
      return res.redirect("/user/signup");
    }

    const oldUserExixts = await User.findOne({
      $or: [{ email: trimmedEmail }, { username: trimmedUsername }],
    });

    if (oldUserExixts) {
      if (oldUserExixts.isVerified == true) {
        req.flash("failure", "User already exists!");
        res.redirect("/user/signup");
      } else {
        await User.deleteOne({
          $or: [{ email: trimmedEmail }, { username: trimmedUsername }],
        });
      }
    }

    const newUser = new User({
      username: trimmedUsername,
      email: trimmedEmail,
    });

    const registeredUser = await User.register(newUser, password);

    const otp = generateOTP();
    registeredUser.verificationToken = otp;
    registeredUser.verificationTokenExpires = Date.now() + 10 * 60 * 1000;
    const verficationAttemptsMade = registeredUser.verificationAttempts;
    registeredUser.verificationAttempts = verficationAttemptsMade + 1;
    await registeredUser.save();

    await sendOTPEmail(trimmedEmail, otp);

    req.flash("success", "OTP has been sent to your email address.");
    req.session.signupEmail = trimmedEmail;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect("/user/signup");
      }
      res.redirect("/user/verify-otp");
    });
  } catch (error) {
    req.flash("failure", error.message);
    res.redirect("/user/signup");
  }
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  res.redirect("/shot");
};

module.exports.profileShow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash("failure", "Invalid user ID format!");
      return res.redirect("/shot");
    }

    const profileOwner = await User.findById(id).populate("shotsLiked");

    if (!profileOwner) {
      req.flash("failure", "User not found!");
      return res.redirect("/shot");
    }

    const userShots = await Shot.find({ author: id })
      .populate("author", "username")
      .sort({ createdAt: -1 });

    if (
      !res.locals.currUser ||
      res.locals.currUser._id.toString() !== profileOwner._id.toString()
    ) {
      profileOwner.email = null;
      profileOwner.totalContributions = null;
    }

    const userLikes = profileOwner.shotsLiked || [];

    res.render("users/show.ejs", {
      cssFiles: [
        "/css/common.css",
        "/css/header.css",
        "/css/footer.css",
        "/css/user-profile.css",
      ],
      profileOwner,
      userShots,
      userLikes,
    });
  } catch (error) {
    req.flash("failure", error.message);
    res.redirect("/shot");
  }
};

module.exports.editShow = async (req, res) => {
  res.render("users/edit.ejs", {
    cssFiles: [
      "/css/common.css",
      "/css/header.css",
      "/css/footer.css",
      "/css/auth.css",
    ],
  });
};

module.exports.edit = async (req, res) => {
  try {
    const { username, email, age } = req.body.user;

    if (!username || !email) {
      req.flash("failure", "Username and email are required.");
      return res.redirect("/user/edit");
    }

    const newUsername = username.trim().toLowerCase();
    const newEmail = email.trim().toLowerCase();

    if (newUsername.length < 3 || newUsername.length > 20) {
      req.flash("failure", "Username must be between 3 and 20 characters.");
      return res.redirect("/user/edit");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      req.flash("failure", "Please enter a valid email address.");
      return res.redirect("/user/edit");
    }
    if (newUsername !== req.user.username) {
      const existingUser = await User.findOne({
        username: newUsername,
        _id: { $ne: req.user._id },
      });
      if (existingUser) {
        req.flash("failure", "Username is already taken.");
        return res.redirect("/user/edit");
      }
    }

    if (newEmail !== req.user.email) {
      const existingEmail = await User.findOne({
        email: newEmail,
        _id: { $ne: req.user._id },
      });
      if (existingEmail) {
        req.flash("failure", "Email is already registered.");
        return res.redirect("/user/edit");
      }
    }

    const updateData = { username: newUsername, email: newEmail };
    if (age && age.trim() !== "") {
      const parsedAge = parseInt(age);
      if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 150) {
        req.flash("failure", "Please enter a valid age (1-150).");
        return res.redirect("/user/edit");
      }
      updateData.age = parsedAge;
    }

    await User.findByIdAndUpdate(req.user._id, updateData);
    req.flash("success", "User updated successfully!");
    res.redirect("/user");
  } catch (error) {
    req.flash("failure", "Unable to update user.");
    res.redirect("/user/edit");
  }
};

module.exports.delete = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    req.logout((error) => {
      if (error) {
        console.error("Logout error after deletion:", error);
      }
      req.flash("success", "Your account has been successfully deleted.");
      res.redirect("/shot");
    });
  } catch (error) {
    req.flash("failure", "Unable to delete account. Please try again.");
    res.redirect("/user/edit");
  }
};

module.exports.logout = (req, res) => {
  req.logout((error) => {
    if (error) {
      req.flash("failure", "Unable to Logout!");
      res.redirect("/shot");
    } else {
      req.flash("success", "Logged out successfully!");
      res.redirect("/shot");
    }
  });
};

# Pixelary ✨

A modern, high-performance full-stack web application inspired by Dribbble. Built with Node.js, Express, and MongoDB, Pixelary provides a seamless platform for developers and designers to showcase their work, discover inspiration, and connect with a creative community.

## 🌐 [Live Demo](https://buildsbyaman-Pixelary.vercel.app)

## ✨ Recent Improvements & Features

- **🚀 Optimized Image Workflow**: Switched to a memory-buffer architecture. Images are now validated *before* being processed, and only uploaded to Cloudinary after all database checks pass.
- **🧹 Orphaned File Cleanup**: Robust error-handling logic ensures that any partially uploaded images are automatically destroyed from Cloudinary if a database operation fails or validation is rejected.
- **📱 Premium Responsive UI**: Fully optimized for all screen sizes (mobile, tablet, desktop) with modern CSS variables, glassmorphism effects, and custom breakpoints.
- **🔄 Visual Loading States**: Global visual feedback system using CSS spinners on all "Post", "Update", and "Delete" buttons to enhance perceived performance.
- **💌 Flash Messaging**: Reliable user notifications for actions like deletion, liking, and errors, ensuring a smooth interactive experience.
- **🎨 Design System**: Unified design tokens (colors, typography, spacing) managed via CSS custom properties in `common.css`.

## 🛠️ Core Features

- **User Authentication**: Secure signup/login with email verification (OTP) and password reset via Nodemailer.
- **Shot Management**: Full CRUD operations for creative shots with support for multiple images, automated descriptions, and custom tagging.
- **Community Interaction**:
  - **Like System**: Real-time likes powered by a dedicated statistics engine.
  - **Reviews & Ratings**: Nested review system with 1-5 star ratings.
  - **View Tracking**: Automatic view counter for every shot.
- **User Profiles**: Comprehensive profiles showcasing user stats, personal portfolio, and liked discoveries.

## 📁 Project Structure

```
Pixelary/
├── 📁 controllers/      # Business logic & route handlers
│   ├── review.js           # Review & feedback management
│   ├── shot.js             # Shot CRUD (with optimized upload & cleanup)
│   ├── stat.js             # Statistics & interaction engine
│   └── user.js             # Auth flow & profile management
├── 📁 models/           # Mongoose schemas & DB relationships
│   ├── review.js           # Review data structure
│   ├── shot.js             # Shot data structure
│   └── user.js             # User data structure
├── 📁 routes/           # RESTful API endpoints
│   ├── review.js           # Review routes
│   ├── shot.js             # Shot management routes
│   ├── stat.js             # Interaction & stats routes
│   └── user.js             # Authentication & user routes
├── 📁 public/           # Static assets
│   ├── 📁 css/             # Modular CSS (common, auth, home, etc.)
│   └── 📁 images/          # Local brand assets
├── 📁 views/            # EJS templates (Server-side rendering)
│   ├── 📁 includes/        # Shared components (Header, Footer, Flash)
│   ├── 📁 layouts/         # Base boilerplate with global JS
│   └── 📁 shots/           # Shot-specific pages
├── app.js               # Express application entry point
├── middleware.js        # Authentication & authorization logic
└── model.js            # Joi validation schemas for data integrity
```

## 🚀 Technology Stack

- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Passport.js (Auth), Multer (Memory Storage), Cloudinary (Image Hosting), Nodemailer (Email)
- **Frontend:** EJS (Templating), Vanilla CSS3 (Custom Design System), FontAwesome 7+
- **Validation & Security:** Joi (Schema Validation), Express-Session, Helmet (Security Headers)
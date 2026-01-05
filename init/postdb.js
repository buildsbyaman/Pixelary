const mongoose = require("mongoose");
const Shot = require("../models/shot.js");
const Review = require("../models/review.js");
const dotenv = require("dotenv");
dotenv.config({ quiet: true });

const authorId = new mongoose.Types.ObjectId("693c559e81cf06947cfcf747");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGOATLASURL);
    console.log("Successfully connected to DB.");

    const review1 = await Review.create({
      comment: "Awesome design!",
      rating: 5,
      owner: authorId,
    });
    const review2 = await Review.create({
      comment: "Very clean and modern.",
      rating: 4,
      owner: authorId,
    });
    const review3 = await Review.create({
      comment: "Stunning work!",
      rating: 5,
      owner: authorId,
    });
    const review4 = await Review.create({
      comment: "Love the layout.",
      rating: 4,
      owner: authorId,
    });
    const review5 = await Review.create({
      comment: "Professional design.",
      rating: 5,
      owner: authorId,
    });

    const shotInitialData = [
      {
        title: "UI/UX Designer",
        image: "/images/1.webp",
        views: 12,
        likes: 1210,
        tags: ["UI/UX", "Web Design", "Figma"],
        description: "Modern UI/UX design concepts for web applications.",
        author: authorId,
        reviews: [review1._id, review2._id],
      },
      {
        title: "Josh Warren",
        image: "/images/2.webp",
        views: 25,
        likes: 1325,
        tags: ["Minimalist Design", "Portfolio", "Illustration"],
        description: "A creative portfolio showcasing modern design ideas.",
        author: authorId,
        reviews: [review3._id, review4._id],
      },
      {
        title: "Immo Unit",
        image: "/images/3.webp",
        views: 18,
        likes: 1412,
        tags: ["Dark Mode", "Real Estate", "Dashboard"],
        description: "A clean real estate application design.",
        author: authorId,
        reviews: [review5._id, review1._id],
      },
      {
        title: "Emote",
        image: "/images/4.webp",
        views: 30,
        likes: 1578,
        tags: ["3D Illustration", "Interaction", "Animation"],
        description: "An interactive system to express emotions visually.",
        author: authorId,
        reviews: [review2._id, review3._id],
      },
      {
        title: "Nixtio",
        image: "/images/5.webp",
        views: 22,
        likes: 1634,
        tags: ["Microinteractions", "Branding", "Tech Startup"],
        description: "Branding and design for tech startups.",
        author: authorId,
        reviews: [review4._id, review5._id],
      },
      {
        title: "Jetpacks",
        image: "/images/6.webp",
        views: 14,
        likes: 1769,
        tags: ["Dark Mode", "Gaming UI", "Futuristic"],
        description: "Futuristic UI concepts inspired by gaming.",
        author: authorId,
        reviews: [review1._id, review3._id],
      },
      {
        title: "Ethereum",
        image: "/images/7.webp",
        views: 37,
        likes: 1882,
        tags: ["UI/UX", "Blockchain", "Crypto"],
        description: "Blockchain wallet and crypto dashboard designs.",
        author: authorId,
        reviews: [review2._id, review4._id],
      },
      {
        title: "Tubik Arts",
        image: "/images/8.webp",
        views: 20,
        likes: 1925,
        tags: ["3D Illustration", "Mobile Design", "Creative"],
        description: "Creative mobile app concepts from Tubik Arts.",
        author: authorId,
        reviews: [review5._id, review1._id],
      },
      {
        title: "Lain",
        image: "/images/9.webp",
        views: 11,
        likes: 2050,
        tags: ["Minimalist Design", "Typography", "Web Layout"],
        description: "Minimal typography-based web design layout.",
        author: authorId,
        reviews: [review3._id, review2._id],
      },
      {
        title: "Pixelary",
        image: "/images/10.webp",
        views: 42,
        likes: 2122,
        tags: ["Microinteractions", "Social Platform", "Design Community"],
        description: "A social platform for designers to showcase work.",
        author: authorId,
        reviews: [review4._id, review5._id],
      },
      {
        title: "Behance",
        image: "/images/11.webp",
        views: 28,
        likes: 2266,
        tags: ["UI/UX", "Portfolio", "Creative Showcase"],
        description: "Creative showcase and portfolio platform.",
        author: authorId,
        reviews: [review1._id, review3._id],
      },
      {
        title: "Figma",
        image: "/images/12.webp",
        views: 33,
        likes: 2391,
        tags: ["Minimalist Design", "UI/UX", "Collaboration"],
        description: "Collaborative tool for UI/UX design projects.",
        author: authorId,
        reviews: [review2._id, review4._id],
      },
      {
        title: "Pixento",
        image: "/images/13.webp",
        views: 19,
        likes: 2478,
        tags: ["Photography", "Visual Design", "Creative"],
        description: "Photography-inspired visual UI elements.",
        author: authorId,
        reviews: [review3._id, review5._id],
      },
      {
        title: "Brandora",
        image: "/images/14.webp",
        views: 26,
        likes: 2531,
        tags: ["Branding", "Logo Design", "Marketing"],
        description: "Modern logo and brand identity design concepts.",
        author: authorId,
        reviews: [review1._id, review4._id],
      },
      {
        title: "NovaDesk",
        image: "/images/15.webp",
        views: 35,
        likes: 2680,
        tags: ["Dashboard", "Analytics", "Productivity"],
        description: "An intuitive analytics dashboard UI design.",
        author: authorId,
        reviews: [review2._id, review5._id],
      },
      {
        title: "Flowbit",
        image: "/images/16.webp",
        views: 24,
        likes: 2739,
        tags: ["Workflow", "UI/UX", "Team Collaboration"],
        description: "Seamless workflow tool with team-focused design.",
        author: authorId,
        reviews: [review3._id, review1._id],
      },
      {
        title: "Skyform",
        image: "/images/17.webp",
        views: 31,
        likes: 2894,
        tags: ["Form Design", "Accessibility", "User Experience"],
        description: "Accessible form designs for web applications.",
        author: authorId,
        reviews: [review4._id, review2._id],
      },
      {
        title: "Auralis",
        image: "/images/18.webp",
        views: 29,
        likes: 2978,
        tags: ["Music App", "Minimalist UI", "Dark Mode"],
        description: "Modern music streaming app interface.",
        author: authorId,
        reviews: [review5._id, review3._id],
      },
    ];

    await Shot.deleteMany({});
    console.log("Successfully cleared old data!");

    await Shot.insertMany(shotInitialData);
    console.log("Successfully inserted new data!");

    mongoose.disconnect();
  } catch (error) {
    console.log("Error occurred - ", error);
  }
}

connectDB();

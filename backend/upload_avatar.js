const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadImage() {
  try {
    const file1 = "C:\\Users\\sachin kumar\\.gemini\\antigravity\\brain\\a234b978-876f-4483-b781-299f04746704\\media__1775154501881.png";
    const result = await cloudinary.uploader.upload(file1, { folder: 'avatars' });
    console.log("SUCCESS:", result.secure_url);
  } catch (err) {
    console.error("FAILED:", err);
  }
}

uploadImage();

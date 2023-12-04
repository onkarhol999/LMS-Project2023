// server.js
import { config } from 'dotenv';
config();

import app from './app.js'; // Move this line after dotenv configuration
import connectionToDB from './config/dbConnection.js';
import cloudinary from 'cloudinary';
import Razorpay from 'razorpay';

const PORT = process.env.PORT || 3000; // or 5000

// cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Razorpay configuration
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

app.listen(PORT, async () => {
  await connectionToDB();
  console.log(`App is running at http://localhost:${PORT}`);
});

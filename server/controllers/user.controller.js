import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import multer from "multer";
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js'

const cookieOptions ={
    maxAge : 7*24*60*60*1000, 
    httpOnly: true,
    secure :true
}

// Registration route
const register = async (req, res, next) => {
  // Extract user details from the request body
  const { fullName, email, password } = req.body;

  // Validate required fields
  if (!fullName || !email || !password) {
    return next(new AppError('All fields are required', 400));
  }

  // Check if the email already exists in the database
  const userExist = await User.findOne({ email });

  if (userExist) {
    return next(new AppError('Email already exists', 400));
  }

  // Create a new user with default avatar
  const user = await User.create({
    fullName,
    email,
    password,
    avatar:{
      public_id: email, 
      secure_id:
        ' https://tse1.mm.bing.net/th?id=OIP.1nWRQ7r_1nEVJ6sdz_zwkwHaE8&pid=Api&rs=1&c=1&qlt=95&w=169&h=113',
    },
  });

  // Check if user creation failed
  if (!user) {
    return next(new AppError('User registration failed', 400));
  }

  // File Upload Logic
  if (req.file) {
    try {
      // Upload file to Cloudinary
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'lms',
        width: 250,
        height: 250,
        gravity: 'faces',
        crop: 'fill',
      });

      // Update user's avatar details based on Cloudinary upload result
      if (result) {
        user.avatar = {
          public_id: result.public_id,
          secure_id: result.secure_url, // Change this to result.secure_id if Cloudinary provides such an identifier
        };

        // Remove file from local storage
        await fs.rm(req.file.path);
      }
    } catch (error) {
      return next(
        new AppError(
          error.message || 'File not uploaded, please try again',
          400
        )
      );
    }
  }

  // Save the user to the database
  await user.save();

  // Clear sensitive information
  user.password = undefined;

  // Generate JWT token
  const token = await user.generateJWTToken();

  // Set the token as a cookie
  res.cookie('token', token, cookieOptions);

  // Send the response
  res.status(201).json({
    success: true,
    message: 'User registration successful',
    user,
  });
};

// Login route
const login = async (req, res, next) => {
  try {
    // Extract login details from the request body
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return next(new AppError('All fields are required', 400));
    }

    // Find the user in the database and check the password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Email or Password does not match', 400));
    }

    // Generate JWT token
    const token = await user.generateJWTToken();
    user.password = undefined;

    // Set the token as a cookie
    res.cookie('token', token, cookieOptions);

    // Send the response
    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Logout route
const logout = (req, res) => {
  // Clear the token cookie on the client side
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
  });

  // Send the response
  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });

};

// Get user profile route
const getProfile = async (req, res, next) => {
  try {
    // Extract user ID from the request
    const userId = req.user.id;

    // Find the user in the database by ID
    const user = await User.findById(userId);

    // Send the user profile as a response
    res.status(200).json({
      success: true,
      message: 'User Details',
      user,
    });
  } catch (error) {
    // Handle errors when fetching the profile
    return next(new AppError('Failed to fetch profile', 500));
  }
};


const forgotPassword = async(req,res, next)=>{
   const{ email } = req.body;

   if(!email){
    return next(new AppError('Email is requried', 400));
   }

   const user = await User.findOne({ email });
   if(!user){
    return next(new AppError('Email not registered', 400));
   }

 const resetToken = await user.generatePasswordResetToken();

 await user.save();

 const resetPasswordURL =  `${process.env.FRONTEND_URI}/reset-password/${resetToken}`

 console.log(resetPasswordURL);

 const subject = 'Reset Password'
 const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset Password</a>\n If the above link not work for some reason then copy pest this link in new tab ${resetPasswordURL}`;
  try {
    await sendEmail(email, subject, message);;

    res.status(200).json({
      success: true,
      message: `Reset password token has been sent to ${email} successfully`
    })
  } catch (error) {

    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    await user.save();
    return next(new AppError(error.message, 500));
  }
}

const resetPassword = async(req,res,next) =>{
      const { resetToken } = req.params;

      const { password } = req.body;

      const forgotPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

            const user = await User.findOne({
              forgotPasswordToken,
              forgotPasswordExpiry:{ $gt: Date.now()}
            });
            if(!user){
              return next(new AppError('Email not registered', 400));
            }

            user.password = password;
            user.forgotPasswordToken = undefined;
            user.forgotPasswordExpiry = undefined;
            user.save();

            res.status(200).json({
              success:true,
              message: 'Password changed successfully ...!'
            })
}
const changedPassword = async(req,res,next) => {
    const {oldPassword, newPassword} = req.body;
    const { id } = req.user;
    if(!oldPassword || !newPassword){
      return next(new AppError('All fields are mendatroy', 400));
    }
    const user = await User.findById(id).select('+password')

    if(!user){
      return next(new AppError('User does not exist', 400));
    }

    const isPasswordValid = await user.comparePassword(oldPassword);
    if(!isPasswordValid){
      return next(new AppError('Password does not match', 400));
    }
    user.password = newPassword;
    await user.save();


    user.password = undefined;
    res.status(200).json({
      success:true,
      message:"Password changed successfully"
    });
};

const updateUser = async (req, res, next) => {
  try {
    const { fullName } = req.body;
    const { id } = req.user; // Use req.user directly

    const user = await User.findById(id);

    if (!user) {
      return next(new AppError('User does not exist', 400));
    }

    if (fullName) {
      user.fullName = fullName;
    }

    if (req.file) {
      // Remove the existing avatar from Cloudinary
      if (user.avatar.public_id) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      }

      try {
        // Upload file to Cloudinary
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'lms',
          width: 250,
          height: 250,
          gravity: 'faces',
          crop: 'fill',
        });

        // Update user's avatar details based on Cloudinary upload result
        if (result) {
          user.avatar = {
            public_id: result.public_id,
            secure_id: result.secure_url,
          };

          // Remove file from local storage
          await fs.promises.unlink(req.file.path);
        }
      } catch (error) {
        return next(new AppError(error.message || 'File not uploaded, please try again', 400));
      }
    }

    await user.save();
    res.status(200).json({
      success: true,
      message: 'User details updated successfully!',
    });
  } catch (error) {
    return next(new AppError(error.message || 'Internal Server Error', 500));
  }
};

// Export the route handlers
export {
   register,
   login,
   logout,
   getProfile,
   forgotPassword,
   resetPassword,
   changedPassword,
   updateUser
}

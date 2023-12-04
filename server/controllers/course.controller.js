import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from 'fs/promises';

const getAllCourses = async function(req,res,next){
      
  try {
    const course = await Course.find({}).select('-lectures');
    res.status(200).json({
      success: true,
      message: 'All Courses',
      course,
    });
  } catch (error) {
     return next(new AppError(error.message,500));
  }
     
}

const getLectureByCourseId = async function(req,res,next){
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if(!course){
      return next(new AppError(error.message,500));
    }
    res.status(200).json({
      success:true,
      message:'Course lectures fetched successfully...!',
      lectures: course.lectures
    })
    } catch (error) {
    return next(new AppError(error.message,500));
  }
}

const createCourse = async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category || !createdBy) {
    return next(new AppError('All fields are required', 400));
  }

  try {
    const course = await Course.create({
      title,
      description,
      category,
      createdBy,
      thumbnail: {
        public_id: 'Dummy',
        secure_url: 'Dummy',
      },
    });

    if (!course) {
      return next(new AppError('Course could not be created, please try again', 500));
    }

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'lms',
      });

      console.log(JSON.stringify(result));

      if (result) {
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
      }

      fs.rmSync(`uploads/${req.file.filename}`); // Use fs.rmSync for synchronous file removal
    }

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    // Return the error using 'next' for consistency in error handling
    return next(new AppError(error.message, 500));
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if req.body is not empty
    if (Object.keys(req.body).length === 0) {
      return next(new AppError('Request body is empty', 400));
    }

    // Use findByIdAndUpdate with the new option to return the updated document
    const course = await Course.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true, // Return the modified document rather than the original
        runValidators: true,
      }
    );

    // Check if course is not found
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    console.error('Error in updateCourse:', error);
    return next(new AppError(error.message, 500));
  }
};
const removeCourse = async(req,res,next)=>{
   try {
      const { id } = req.params;
      const course = await Course.findById(id);
   
      if (!course) {
        return next(new AppError('Course not found', 404));
      }

      await course.deleteOne();

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully'
      })
                 
   } catch (error) {
    return next(new AppError(error.message, 500));
   }
}


// Controller function
const addLectureToCourseById = async (req, res, next) => {
  try {
      const { title, description, lecture } = req.body; // Added lecture in destructuring
      const { id } = req.params;

      if (!title || !description || !lecture) {
          return next(new AppError('All fields are required', 400));
      }

      const course = await Course.findById(id);

      if (!course) {
          return next(new AppError('Course not found', 404));
      }

      // Initialize lecture object with default values
      const lectureData = {
          title,
          description,
          lecture: {
              public_id: '', // Provide default value or set to null as needed
              secure_url: '' // Provide default value or set to null as needed
          }
      };

      if (req.file) {
          try {
              const result = await cloudinary.v2.uploader.upload(req.file.path, {
                  folder: 'lms',
              });

              console.log(JSON.stringify(result));

              if (result) {
                  lectureData.lecture.public_id = result.public_id;
                  lectureData.lecture.secure_url = result.secure_url;
              }

              fs.rmSync(`uploads/${req.file.filename}`);
          } catch (error) {
              return next(new AppError(error.message));
          }
      }

      course.lectures.push(lectureData);

      course.numberOfLectures = course.lectures.length;

      await course.save();
      res.status(200).json({
          success: true,
          message: 'Lectures successfully added to the course',
          course,
      });
  } catch (error) {
      return next(new AppError(error.message, 500));
  }
};

export{
  getAllCourses,
  getLectureByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
  addLectureToCourseById
}
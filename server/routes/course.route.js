import { Router } from "express";
import { addLectureToCourseById, createCourse, getAllCourses, getLectureByCourseId, removeCourse, updateCourse } from "../controllers/course.controller.js";
import { authorizeSubscriber, authorizedRoles, isLoggedIn } from "../middlerwares/auth.middleware.js";
import upload from "../middlerwares/multer.middleware.js";


const router =  Router();

router.route('/')
    .get(getAllCourses)
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        upload.single('lecture'),
        createCourse
        );
    
    

router.route('/:id')  // Corrected route parameter placeholder
        .get(isLoggedIn,authorizeSubscriber, getLectureByCourseId)
        .put(isLoggedIn,updateCourse,authorizedRoles('ADMIN'))
        .delete(isLoggedIn,removeCourse,authorizedRoles('ADMIN'))
        .post(isLoggedIn,addLectureToCourseById,authorizedRoles('ADMIN'),upload.single('lecture'));
    
export default router;

 
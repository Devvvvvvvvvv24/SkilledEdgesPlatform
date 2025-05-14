import {Router} from 'express';
import { addLecturesToCourseById, createCourse, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse } from '../controllers/course.controller.js';
import { authorizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router=Router();

router.route('/')
   .get(getAllCourses)//in the same route we can add multiple methods that we can called
   .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),  //CHECKS FOR AUTHORIZATION
    upload.single('thumbnail'), //IMAGE UPLOAD OR TRANSITION
    createCourse
);



// router.get('./:id',getLecturesByCourseId);
router.route('/:id')
.get(isLoggedIn ,getLecturesByCourseId)
.put(isLoggedIn,
    authorizedRoles('ADMIN'),
    updateCourse)
.delete(isLoggedIn,
    authorizedRoles('ADMIN'),
    removeCourse)  //middleware looged in use
    .post(isLoggedIn,
        authorizedRoles('ADMIN'),
        upload.single('lecture'),
        addLecturesToCourseById
    );

export default router;


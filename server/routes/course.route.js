import { Router } from 'express';
import {
  addLecturesToCourseById,
  createCourse,
  getAllCourses,
  getLecturesByCourseId,
  removeCourse,
  updateCourse
} from '../controllers/course.controller.js';

import {
  authorizedRoles,
  authorizeSubscriber,
  isLoggedIn
} from '../middlewares/auth.middleware.js';

import upload from '../middlewares/multer.middleware.js';

const router = Router();

// Get all courses or create a new one (ADMIN only)
router.route('/')
  .get(getAllCourses)
  .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('thumbnail'),
    createCourse
  );

// Course-specific operations by ID
router.route('/:id')
  // Get lectures (only if subscribed)
  .get(isLoggedIn, authorizeSubscriber, getLecturesByCourseId)

  // Update course (ADMIN only)
  .put(isLoggedIn, authorizedRoles('ADMIN'), updateCourse)

  // Delete course (ADMIN only)
  .delete(isLoggedIn, authorizedRoles('ADMIN'), removeCourse)

  // Add a lecture to course (ADMIN only)
  .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('lecture'),
    addLecturesToCourseById
  );

export default router;

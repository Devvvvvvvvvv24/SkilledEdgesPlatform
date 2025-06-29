import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

// GET all courses (excluding lectures)
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).select("-lectures");
    res.status(200).json({
      success: true,
      message: "All courses fetched successfully",
      courses,
    });
  } catch (e) {
    next(new AppError(e.message, 500));
  }
};

// GET lectures by course ID
const getLecturesByCourseId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError("Invalid course ID", 404));
    }

    res.status(200).json({
      success: true,
      message: "Course lectures fetched successfully",
      lectures: course.lectures,
    });
  } catch (e) {
    next(new AppError(e.message, 500));
  }
};

// POST create new course
const createCourse = async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category || !createdBy) {
    return next(new AppError("All fields are required", 400));
  }

  const course = await Course.create({
    title,
    description,
    category,
    createdBy,
    thumbnail: {
      public_id: "Dummy",
      secure_url: "Dummy",
    },
  });

  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });

      if (result) {
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
      }

      await fs.unlink(req.file.path);
    } catch (e) {
      return next(new AppError(e.message, 500));
    }
  }

  await course.save();

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    course,
  });
};

// PUT update existing course
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndUpdate(
      id,
      { $set: req.body },
      { runValidators: true, new: true }
    );

    if (!course) {
      return next(new AppError("Course with given ID does not exist", 404));
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (e) {
    next(new AppError(e.message, 500));
  }
};

// DELETE course by ID
const removeCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError("Course with given ID does not exist", 404));
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (e) {
    next(new AppError(e.message, 500));
  }
};

// POST add lecture to course
const addLecturesToCourseById = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;

    if (!title || !description) {
      return next(new AppError("All fields are required", 400));
    }

    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError("Course with given ID does not exist", 404));
    }

    const lectureData = {
      title,
      description,
      lecture: {},
    };

    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          resource_type: "video",
        });

        if (result) {
          lectureData.lecture.public_id = result.public_id;
          lectureData.lecture.secure_url = result.secure_url;
        }

        await fs.unlink(req.file.path);
      } catch (e) {
        return next(new AppError(e.message, 500));
      }
    }

    course.lectures.push(lectureData);
    course.numbersOfLectures = course.lectures.length;

    await course.save();

    res.status(200).json({
      success: true,
      message: "Lecture added successfully to the course",
      course,
    });
  } catch (e) {
    next(new AppError(e.message, 500));
  }
};

export {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
  addLecturesToCourseById,
};

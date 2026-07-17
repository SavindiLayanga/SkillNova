import express from "express";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  bulkAction,
} from "../controllers/adminCoursesController.js";

const router = express.Router();

router.get("/", getCourses);
router.post("/", createCourse);
router.patch("/bulk-action", bulkAction); // Put this before /:id so it doesn't get confused as an ID
router.patch("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;

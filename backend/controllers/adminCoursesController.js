import { Course } from "../models/Course.js";

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private/Admin
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Server error fetching courses" });
  }
};

// @desc    Create a course
// @route   POST /api/admin/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Server error creating course" });
  }
};

// @desc    Update a course
// @route   PATCH /api/admin/courses/:id
// @access  Private/Admin
export const updateCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Server error updating course" });
  }
};

// @desc    Delete a course
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
export const deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ error: "Server error deleting course" });
  }
};

// @desc    Bulk action on courses (Delete, Archive, Publish)
// @route   PATCH /api/admin/courses/bulk-action
// @access  Private/Admin
export const bulkAction = async (req, res) => {
  try {
    const { courseIds, action } = req.body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ error: "No course IDs provided" });
    }

    if (!action) {
      return res.status(400).json({ error: "No action provided" });
    }

    let result;

    switch (action.toLowerCase()) {
      case 'delete':
        result = await Course.deleteMany({ _id: { $in: courseIds } });
        res.status(200).json({ message: `Deleted ${result.deletedCount} courses` });
        break;
      
      case 'archive':
        result = await Course.updateMany(
          { _id: { $in: courseIds } },
          { $set: { status: 'Archived' } }
        );
        res.status(200).json({ message: `Archived ${result.modifiedCount} courses` });
        break;

      case 'publish':
        result = await Course.updateMany(
          { _id: { $in: courseIds } },
          { $set: { status: 'Published' } }
        );
        res.status(200).json({ message: `Published ${result.modifiedCount} courses` });
        break;

      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    console.error("Error performing bulk action:", error);
    res.status(500).json({ error: "Server error performing bulk action" });
  }
};

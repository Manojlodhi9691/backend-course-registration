const Course = require('../models/Course');
const User = require('../models/Student')
exports.getAllCourses = async (req, res) => {
  try {
    // Explicitly tell Mongoose to use the 'Faculty' model for population
    const courses = await Course.find().populate({
      path: 'faculty',
      model: 'Faculty',
      select: 'name'
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching courses" });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, price, description } = req.body;
    const newCourse = new Course({ 
      title, 
      price, 
      description,
      faculty: req.user.id // ID from auth middleware
    });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// backend/controllers/courseController.js
exports.enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        // FIX: Prevent multiple enrollments
        if (course.studentsEnrolled.includes(userId)) {
            return res.status(200).json({ success: true, message: "Already enrolled" });
        }

        // Add student to course
        course.studentsEnrolled.push(userId);
        await course.save();

        // Add course to student's record (for the dashboard count)
        const student = await User.findById(userId);
        if (student) {
            if (!student.enrolledCourses) student.enrolledCourses = [];
            student.enrolledCourses.push(courseId);
            await student.save();
        }

        res.status(200).json({ success: true, message: "Enrolled successfully" });
    } catch (error) {
        console.error("Enrollment error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getFacultyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ faculty: req.user.id });

    const stats = courses.map(course => {
      const enrolled = course.studentsEnrolled || []; 
      return {
        ...course._doc,
        studentCount: enrolled.length,
        revenue: enrolled.length * (course.price || 0)
      };
    });

    res.json(stats);
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('faculty', 'name');
        
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // FIX: Match the field name 'studentsEnrolled' from your Course model
        const isEnrolled = course.studentsEnrolled && req.user 
            ? course.studentsEnrolled.includes(req.user.id) 
            : false;

        res.status(200).json({
            ...course._doc,
            isEnrolled
        });
    } catch (error) {
        console.error("Error in getCourseById:", error);
        res.status(500).json({ message: "Server error fetching course details" });
    }
};
exports.getEnrolledCourses = async (req, res) => {
    try {
        // Find the user and populate the 'enrolledCourses' field
        const user = await User.findById(req.user.id).populate('enrolledCourses');
        
        if (!user) return res.status(404).json({ message: "User not found" });

        // Return just the array of course objects
        res.status(200).json(user.enrolledCourses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching enrolled courses" });
    }
};
const Course = require('../models/Course');
const User = require('../models/Student'); 

// 1. PUBLIC: Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('faculty', 'name');
        res.status(200).json(courses);
    } catch (err) {
        console.error("Fetch Courses Error:", err);
        res.status(500).json({ message: "Error fetching course catalog" });
    }
};

// 2. FACULTY ONLY: Create a new course (Updated with detailed fields)
exports.createCourse = async (req, res) => {
    try {
        // Pulling the new fields from the frontend request body
        const { 
            title, 
            price, 
            description, 
            instructorExperience, 
            duration, 
            batchTiming, 
            subjects 
        } = req.body;
        
        const newCourse = new Course({ 
            title, 
            price, 
            description,
            instructorExperience,
            duration,
            batchTiming,
            subjects: subjects || [], // Expecting an array of strings
            faculty: req.user.id 
        });

        const savedCourse = await newCourse.save();

        // Populate faculty name so the UI updates correctly immediately
        const populatedCourse = await Course.findById(savedCourse._id).populate('faculty', 'name');

        res.status(201).json(populatedCourse);
    } catch (err) {
        console.error("Create Course Error:", err);
        res.status(500).json({ message: "Failed to create course: " + err.message });
    }
};

// 3. PUBLIC/PRIVATE: Get single course details (Updated with full metadata)
exports.getCourseById = async (req, res) => {
    try {
        // Added 'email' to faculty populate for more detail
        const course = await Course.findById(req.params.id).populate('faculty', 'name email');
        
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        let isEnrolled = false;
        if (req.user) {
            isEnrolled = course.studentsEnrolled.includes(req.user.id);
        }

        res.status(200).json({
            ...course._doc,
            isEnrolled
        });
    } catch (error) {
        console.error("Error in getCourseById:", error);
        res.status(500).json({ message: "Server error fetching course details" });
    }
};

// 4. PRIVATE: Handle Enrollment
exports.enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        if (course.studentsEnrolled.includes(userId)) {
            return res.status(200).json({ success: true, message: "Already enrolled" });
        }

        course.studentsEnrolled.push(userId);
        await course.save();

        const student = await User.findById(userId);
        if (student) {
            if (!student.enrolledCourses) student.enrolledCourses = [];
            student.enrolledCourses.push(courseId);
            await student.save();
        }

        res.status(200).json({ success: true, message: "Enrolled successfully" });
    } catch (error) {
        console.error("Enrollment error:", error);
        res.status(500).json({ message: "Internal server error during enrollment" });
    }
};

// 5. FACULTY ONLY: Dashboard Stats
exports.getFacultyCourses = async (req, res) => {
    try {
        const courses = await Course.find({ faculty: req.user.id })
            .populate('studentsEnrolled', 'name email');

        const stats = courses.map(course => {
            const enrolled = course.studentsEnrolled || []; 
            return {
                ...course._doc,
                studentCount: enrolled.length,
                revenue: enrolled.length * (course.price || 0),
                enrolledStudents: enrolled 
            };
        });

        res.status(200).json(stats);
    } catch (err) {
        console.error("Faculty Dashboard Error:", err);
        res.status(500).json({ message: "Error fetching instructor data" });
    }
};

// 6. STUDENT ONLY: Purchased Library
exports.getEnrolledCourses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('enrolledCourses');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user.enrolledCourses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching your learning library" });
    }
};
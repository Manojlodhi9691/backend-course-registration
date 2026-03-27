import Course from '../models/Course.js';
import User from '../models/Student.js'; // Ensure the .js extension is here too

// 1. PUBLIC: Get all courses
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('faculty', 'name');
        res.status(200).json(courses);
    } catch (err) {
        console.error("Fetch Courses Error:", err);
        res.status(500).json({ message: "Error fetching course catalog" });
    }
};

// 2. FACULTY ONLY: Create a new course
export const createCourse = async (req, res) => {
    try {
        const { 
            title, price, description, instructorExperience, 
            duration, batchTiming, subjects 
        } = req.body;
        
        const newCourse = new Course({ 
            title, price, description, instructorExperience,
            duration, batchTiming,
            subjects: subjects || [], 
            faculty: req.user.id 
        });

        const savedCourse = await newCourse.save();
        const populatedCourse = await Course.findById(savedCourse._id).populate('faculty', 'name');

        res.status(201).json(populatedCourse);
    } catch (err) {
        console.error("Create Course Error:", err);
        res.status(500).json({ message: "Failed to create course: " + err.message });
    }
};

// 3. PUBLIC/PRIVATE: Get single course details
export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('faculty', 'name email');
        
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        let isEnrolled = false;
        if (req.user) {
            isEnrolled = course.studentsEnrolled.includes(req.user.id);
        }

        res.status(200).json({ ...course._doc, isEnrolled });
    } catch (error) {
        console.error("Error in getCourseById:", error);
        res.status(500).json({ message: "Server error fetching course details" });
    }
};

// 4. PRIVATE: Handle Enrollment
export const enrollInCourse = async (req, res) => {
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
export const getFacultyCourses = async (req, res) => {
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
export const getEnrolledCourses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('enrolledCourses');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user.enrolledCourses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching your learning library" });
    }
};

// 7. FACULTY ONLY: Add Lecture
export const addLecture = async (req, res) => {
    try {
        const { title, videoUrl } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) return res.status(404).json({ message: "Course not found" });

        if (course.faculty.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized to edit this course" });
        }

        course.lectures.push({ title, videoUrl });
        await course.save();

        res.status(200).json({ message: "Lecture added successfully", lectures: course.lectures });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 8. FACULTY ONLY: Delete Lecture
export const deleteLecture = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;

        const course = await Course.findByIdAndUpdate(
            courseId,
            { $pull: { lectures: { _id: lectureId } } }, 
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ 
            message: "Lecture deleted successfully", 
            lectures: course.lectures 
        });
    } catch (err) {
        console.error("Error deleting lecture:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
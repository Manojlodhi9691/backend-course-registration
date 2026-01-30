const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Fix: Destructure auth and authorize from the middleware object
const { auth, authorize } = require('../middleware/auth'); 

// 1. Create Course (Only Faculty)
// Changed path to '/create' to match your frontend logic
router.post('/create', auth, authorize('faculty'), courseController.createCourse);

// 2. Get All Courses
router.get('/', courseController.getAllCourses);

// 3. Faculty Stats
router.get('/faculty', auth, authorize('faculty'), courseController.getFacultyCourses);

// 4. Enroll (Students only)
router.post('/enroll', auth, authorize('student'), courseController.enrollInCourse);

router.get('/enrolled', auth, authorize('student'), courseController.getEnrolledCourses);
// 5. Get Course by ID
router.get('/:id', courseController.getCourseById);

module.exports = router;
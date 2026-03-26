const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

const { auth, authorize } = require('../middleware/auth'); 


router.post('/create', auth, authorize('faculty'), courseController.createCourse);


router.get('/', courseController.getAllCourses);


router.get('/faculty', auth, authorize('faculty'), courseController.getFacultyCourses);


router.post('/enroll', auth, authorize('student'), courseController.enrollInCourse);

router.get('/enrolled', auth, authorize('student'), courseController.getEnrolledCourses);

router.get('/:id', courseController.getCourseById);

router.put('/:id/add-lecture', auth, authorize('faculty'), courseController.addLecture);

module.exports = router;
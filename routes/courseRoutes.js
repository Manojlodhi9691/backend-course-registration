import express from 'express';
// 1. Import the controller functions (Note the .js extension)
import { 
    createCourse, 
    getAllCourses, 
    getFacultyCourses, 
    enrollInCourse, 
    getEnrolledCourses, 
    getCourseById, 
    addLecture, 
    deleteLecture 
} from '../controllers/courseController.js';

// 2. Import your middleware (Using the names defined in your auth file)
import { auth, authorize } from '../middleware/auth.js'; 

const router = express.Router();

// Existing Routes
router.post('/create', auth, authorize('faculty'), createCourse);
router.get('/', getAllCourses);
router.get('/faculty', auth, authorize('faculty'), getFacultyCourses);
router.post('/enroll', auth, authorize('student'), enrollInCourse);
router.get('/enrolled', auth, authorize('student'), getEnrolledCourses);
router.get('/:id', getCourseById);
router.put('/:id/add-lecture', auth, authorize('faculty'), addLecture);

// 3. Updated Delete Route to use 'auth' and 'authorize' to match your imports
router.delete('/:courseId/lectures/:lectureId', auth, authorize('faculty'), deleteLecture);
export default router;
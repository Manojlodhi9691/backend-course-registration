const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String 
  },
  
  // --- NEW: Instructor & Batch Metadata ---
  instructorExperience: { 
    type: String, 
    default: "5+ Years in Industry" 
  },
  duration: { 
    type: String, 
    default: "8 Weeks (Certification Course)" 
  },
  batchTiming: { 
    type: String, 
    default: "Mon-Fri | 6:00 PM - 8:00 PM" 
  },
  
  // --- NEW: Curriculum / Subjects ---
  // Example: ["Data Mining", "Data Warehousing", "Classification Algorithms"]
  subjects: {
    type: [String],
    default: []
  },

  faculty: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Faculty', 
    required: false 
  },
  
  studentsEnrolled: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student',
    default: []
  }]
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('Course', courseSchema);
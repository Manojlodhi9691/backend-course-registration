const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  // Points to Faculty collection
  faculty: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Faculty', 
    required: true 
  },
  // Points to Student collection
  studentsEnrolled: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' ,
    default:[]
  }]
});

module.exports = mongoose.model('Course', courseSchema);
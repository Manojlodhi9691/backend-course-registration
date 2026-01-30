const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'faculty' } // Helps frontend routing
}, { timestamps: true });

module.exports = mongoose.model('Faculty', FacultySchema);
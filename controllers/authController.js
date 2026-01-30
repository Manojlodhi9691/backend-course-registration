const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingStudent = await Student.findOne({ email });
        const existingFaculty = await Faculty.findOne({ email });
        
        if (existingStudent || existingFaculty) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newStudent = new Student({
            name,
            email,
            password: hashedPassword, 
            role: 'student' 
        });

        await newStudent.save();
        res.status(201).json({ message: "Student registered successfully!" });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Search Faculty first, then Student
        let user = await Faculty.findOne({ email });
        let userType = 'faculty';

        if (!user) {
            user = await Student.findOne({ email });
            userType = 'student';
        }

        if (!user) {
            return res.status(404).json({ message: "Account not found" });
        }

        // 2. SMART PASSWORD VERIFICATION
        // Check if the password in DB is hashed (bcrypt hashes start with '$2')
        const isHashed = user.password.startsWith('$2');
        let isMatch = false;

        if (isHashed) {
            // Compare typed password with hashed DB password
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // Direct comparison for your manual plain-text "123" entries
            isMatch = (password === user.password);
        }

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 3. Create Token
        const token = jwt.sign(
            { id: user._id, role: userType }, 
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: userType 
            }
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server error during login" });
    }
};

exports.getMe = async (req, res) => {
    try {
        let user = await Faculty.findById(req.user.id).select('-password');
        if (!user) {
            user = await Student.findById(req.user.id).select('-password');
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userObj = user.toObject();
        userObj.role = req.user.role; 

        res.json(userObj);
    } catch (err) {
        console.error("GetMe Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};
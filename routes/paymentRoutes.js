const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Course = require('../models/Course'); // Added Course model import

// 1. Create Order Route
router.post('/create-order', auth, async (req, res) => {
    if (req.user.role === 'faculty') {
        return res.status(403).json({ message: "Faculty cannot purchase courses." });
    }

    try {
        const { amount, courseId } = req.body; // Expecting courseId from frontend

        // --- NEW CHECK: PREVENT MULTIPLE PURCHASES ---
        if (courseId) {
            const course = await Course.findById(courseId);
            if (course && course.studentsEnrolled.includes(req.user.id)) {
                return res.status(400).json({ 
                    message: "You are already enrolled in this course." 
                });
            }
        }
        // ---------------------------------------------

        console.log("Creating order for amount:", amount);

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(Number(amount) * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await instance.orders.create(options);
        console.log("Order Created Successfully:", order.id);
        res.status(200).json(order);

    } catch (error) {
        console.error("--- RAZORPAY DEBUG ---");
        const errorDesc = error.error ? error.error.description : error.message;
        res.status(500).json({ message: "Order creation failed", detail: errorDesc });
    }
});

// 2. VERIFY ROUTE
router.post('/verify', auth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            console.log("Payment Verified Successfully");
            return res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            console.error("Signature Mismatch");
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: "Internal Server Error during verification" });
    }
});

module.exports = router;
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Add to your .env
  key_secret: process.env.RAZORPAY_KEY_SECRET // Add to your .env
});

// Step 1: Create an Order
exports.createOrder = async (req, res) => {
  try {
    const options = {
    amount: 50000, // Fixed ₹500 for testing
    currency: "INR",
    receipt: "test_receipt_1",
};

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: "Razorpay Order Error" });
  }
};

// Step 2: Verify Payment Signature
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature === razorpay_signature) {
    res.status(200).json({ success: true, message: "Payment Verified" });
  } else {
    res.status(400).json({ success: false, message: "Invalid Signature" });
  }
};
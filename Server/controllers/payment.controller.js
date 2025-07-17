const Razorpay = require('razorpay');
const crypto = require('crypto');
module.exports.orderPayment = async (req,res) => {
    try{
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const options = {
            amount: req.body.amount * 100,
            currency: 'INR',
            receipt: 'order_rcptid_11',
        };
        
        const response = await razorpay.orders.create(options);
        
        res.status(200).json({
            success: true,
            response
        })
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

module.exports.orderValidate = async (req,res) => {
    try{
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
        const sha = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        sha.update(razorpay_order_id + '|' + razorpay_payment_id);
        const hmac = sha.digest('hex'); 
        if(hmac === razorpay_signature){
            res.status(200).json({
                success: true,
                message: 'Payment Successful'
            })
        }
        else{
            res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            })
        }
        }
    catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}
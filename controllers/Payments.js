const {instance} = require("../config/razorppay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");


//capture the payment and initiate Razorpay order
exports.capturePayment = async(req, res) => {
    //get courseId and UserId
    const {course_id} = req.body;
    const userId = req.user.id;

    //Validation
    //valid courseId
    if(!course_id)
    {
        return res.json({
            success:false,
            message:'Please provide valid course ID',
        });
    };
 
    //valid courseDetail
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course)
        {
            return res.json({
                success:false,
                message:'Could not find the course',
            });
        }
    }
    catch(error)
    {

    }
    //user already pay for the same course
    //order create
    //return response

};
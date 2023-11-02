const {instance} = require("../config/razorppay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");


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

        //user already pay for the same course
        //right now user is in string type and inside course, uer is of objectid
        //convert string to objectid
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success:false,
                message:'Student is already enrolled',
            })
        }
    }
    catch(error)
    {
        console.error(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        });

    }

    
    //order create
    const amount = course.price;
    const currency = "INR";
    
    //creating options object
    const options = {
        amount: amount * 100,
        currency,
        receipt: Mathrandom(Date.now()).toString(),
        notes:{
            courseId: course_id,
            userId,
        }

    };

    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log("paymentResponse=> ",paymentResponse);

        //return response
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDecription,
            thumbnail:course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        });
        
        }
    catch(error){
        console.error(error)
        return res.json({
            success:false,
            message:"Could not initiate order",
        });



    }



    //return response

};


//verify Signature of Razorpay and Server
exports.verifySignature = async(req,res) => {
    const webhookSecret = "12345678";

    const signature = req.headers["x-razorpay-signature"];

    // Hmac = hashed based message authentication code 
    // SHA = secure hashing algorithm
    // Hmac need 2 parameter: Algoname and secret key
    //making object of Hmac
    const shasum = crypto.createHmac("sha256", webhookSecret);

    //2 convert this to string format
    shasum.update(JSON.stringify(req.body));

    //3 output of hashing is in digest
    const digest = shasum.digest("hex");

    //this req is not coming from frontend, this is coming
    //from razorpay, so we can fetch corse id and uer id from notes
    if(signature === digest)
    {
        console.log("Payment is Authorized");

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
            //fulfill the action

            //find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id: courseId},
                {$push: {studentsEnrolled: userId}},
                {new: true},
            );

            if(!enrolledCourse)
            {
                return res.status(500).json({
                    success:false,
                    message:"Could not initiate order",
                });
            }
            console.log(enrolledCourse);

            //find the student and add the course to their enrolled corse me
            const enrolledStudent = await User.findOneAndUpdate(
                {
                    _id:userId
                },
                {
                    $push: {courses: courseId}
                },
                { new: true},
            );
            console.log(enrolledStudent);

            //mail end kardo confirmatio wala
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulation from studynotion",
                "Congratulation, you are onbarded into new studynotion Course",
            );
            console.log(emailResponse);  
            return res.status(200).json({
                success:true,
                message:"Signature Verified and Course Added",
            });


        }
        catch(error)
        {
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }

    else{
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        });
    }


};

const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");


//createRating
const createRating = async(req, res) => {
    try{
    //get user id
    const userId = req.user.id;

    //fetchdata from req body
    const {courseId, rating, review} = req.body;

    //check if user is enrolled or not
    const courseDetails = await Course.findOne({
        _id: courseId,
        studentsEnrolled: {$elemMatch: {$eq: userId} },
    });

    //or we can check from user model, that particular user consist that course id or not in the course list
    // await User.findById( {_id: courseId,} )//may be its wrong

    if(!courseDetails)
    {
        return res.statu(404).json({
            success:false,
            message:'Student is not enrolled in the course',
        });
    }

    //check if user already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
        user:userId,
        course:courseId,
    });

    if(alreadyReviewed)
    {
        return res.status(403).json({
            success:false,
            message:'Course is already reviewed by the user',
        });
    }

    //create rating and review
    const ratingReview = await RatingAndReview.create({
        rating,
        review,
        user: userId,
        coure: courseId,
    });

    //update course with this rating/review
    const updatedCourseDetails = await Course.findByIdAndUpdate(
        {
            _id:courseId,
        },
        {
            $push: {
                ratingAndReviews: ratingReview._id,
            }
        },
        {
            new:true,
        });

    console.log(updatedCourseDetails);

    //return response
    return res.status(200).json({
        success:true,
        message: "RatingandReview created Successfully",
        ratingReview,
    });

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Rating and review not created",
        });
    }

}

//getAveragerating
exports.getAverageRating = async(req, res) => {
    try{
        //get course ID
        const courseId = req.body.courseId;

        //calculating avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating: { $avg: "$rating"},
                }
            }
        ])

        //return response
        if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating,
            })
        }

        //if no rating/review exist
        return res.status(200).json({
            success:true,
            message:'Average Rating is 0, no rating given till now',
            averageRating:0,
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });

    }
}

//getAllRatingAndReviews
exports.getAllRating = async(req, res) => {
    try{
        const allReviews = await RatingAndReview.find({})
        .sort({ rating: "desc" })
        .populate({
            path: "user",
            //it means this fields are mandatory
            select: "firstname lastname email image",
        })
        .populate({
            path:"course",
            select: "courseName",
        })
        .exec();
    
    return res.status(200).json({
        success:true,
        message:"All review fetched successfully",
        data:allReviews
    });

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
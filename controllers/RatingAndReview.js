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

//getAllRating
const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

//createRating
const createRating = async(req, res) => {
    try{
    //get user id
    const user = req.user.id;

    //fetchdata from req body
    const {courseId, rating, review} = req.body;

    //check if user is enrolled or not
    //check if user already reviewed the course
    //create rating and review
    //update course with this rating/review
    //return response
    
    

    //validation
    if(!rating || !review)
    {
        return res.status(400).json({
            success:false,
            message:"Please Enter all data",
        });
    }

    const RatingReview = await RatingAndReview.create(
        {
        rating,
        review,
    });

    //return response
    return res.status(200).json({
        success:true,
        message: "RatingandResponse created Successfully",
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
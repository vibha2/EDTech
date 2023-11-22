const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const Course = require("../models/Course");

exports.updateProfile = async(req, res) => {
    try{
        //get data
        const { dateOfBirth="", about="", contactNumber, gender} = req.body;

        //get userId
        const id = req.user.id;

        //validation
        if(!contactNumber || !gender || !id )
         {
             return res.status(400).json({
                 success:false,
                 message:'All field are required',
             });
         }

        //find profile by id
        const userDetails = await User.findById(id);
        const profileDetails = await Profile.findById(userDetails.additionalDetails);
        // const profileId = userDetails.additionalDetails;
        // const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        //save the updated profile
        await profileDetails.save();

        //return response
        return res.status(200).json({
            success:success,
            message:'Profile Updated Successfully',
            profileDetails,
        });

    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'Internal Server Error',
            error: error.message,
        });
    }
};

//HW:konsa tarika hai jisse req reshedule ke skte hai, ex delete account in 5 days
//wht is cron job

//delete Account
exports.deleteAccount = async(req, res) => {
    try{
        console.log("Printing ID: ", req.user.id);
        //get id
        const id = req.user.id;

        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:'User not found'
            });
        }

        //delete profile of user
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails})

        //Todo: HW unenroll user from all enrolled courses

        //delete user
        await User.findByIdAndDelete({_id: id});

        //return response
        return res.status(200).json({
            success:true,
            message:'User Deleted Successfully',
        });

    }
    catch(err)
    {
        //return response
        return res.status(500).json({
            success:false,
            message:'User cannot be Deleted Successfully',
        });
    }
};

//getalluserdetails
exports.getAllUserDetails = async(req, res) => {
    try{
        //get id
        const id = req.user.id;
                                      
        //validation and get user details
        const userdetails = await User.findById(id)
                .populate("additionalDetails")
                .exec();

        console.log("userDetails=> ",userDetails);
        //return response
        return res.status(500).json({
            success:false,
            message:'User Data fetched Successfully',
            data:userdetails,
        });

    }
    catch(error)
    {
        //return response
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

//https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  

exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
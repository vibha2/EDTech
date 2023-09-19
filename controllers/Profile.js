const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async(req, res) => {
    try{
        //get data
        const { dateOfBirth="", about="", contactNumber, gender} = req.body;

        //get userId
        const id = req.user.id;

        //validation
        if(contactNumber || !gender || !id )
         {
             return res.status(400).json({
                 success:false,
                 message:'All field are required',
             });
         }

        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
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
        const userdetails = await User.findById(id).populate("additionalDetails").exec();

        //return response
        return res.status(500).json({
            success:false,
            message:'User Data fetched Successfully',
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
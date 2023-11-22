const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

//sendOTP for email verification
exports.sendOTP = async (req,res) => {

    try {
        //fetch email from request body
        const {email} = req.body;

        
        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        //if user already exit, then return a response
        if(checkUserPresent)
        {
            return res.status(401).json({
                succes:false,
                message:'User already registered',
            })
        }


        //generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        //it includes only number
        console.log("OTP generated: ", otp);

        //check uniques otp or not
        let result = await OTP.findOne({otp: otp});

        //if not uniques, then generate otp again
        while(result) {
            otp =  otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            // result = await OTP.findOne({otp: otp});
        }

        //now we've generated unique otp, now insert into db

        const otpPayload = {email, otp};

        //create an entry for DB
        const otpBody = await OTP.create(otpPayload);
        console.log("otpBody=> ", otpBody);

        //return response successful
        res.status(200).json({
            succes:true,
            message:'OTP sent Succefully',
            otp,
        });



    }
    catch(error){
        console.log("error: ",error);
        return res.status(500).json({
            succes:false,
            message:error.message,
        })

    }
   


};

//signup
exports.signUp = async (req,res) => {

    try{
        //data fetch from request ki body
    const {
        firstName, 
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    } = req.body;

    //validate karlo
    if(!firstName || !lastName || !email || !password 
        || !confirmPassword || !otp ){
            return res.status(403).json({
                succes:false,
                message:"All fields are required",
            })
    
        }

    //2 password match karo
    if(password !== confirmPassword)
    {
        return res.status(400).json({
            succes:false,
            message:"Password and ConfirmPassword value does not match, please try again",
        });

    }

    //check user already exist or not
    const existingUser =  await User.findOne({email});
    if(existingUser)
    {
        return res.status(400).json({
            succes:false,
            message:"User is already registered",
        });

    }

    //find most recent otp stored for the user
    // createdAt:-1 sorting by descending order
    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    console.log("recentOtp=> ",recentOtp);

    if(recentOtp.length == 0)
    {
        //OTP not found
        return res.status(400).json({
            succes:false,
            message:"OTP not found",
        });
    } else if(otp !== recentOtp[0].otp){

        //Invalid OTP
        return res.status(400).json({
            succes:false,
            message:"Invlid OTP",
        });
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Create the user
    let approved = "";
    approved === "Intructor"? (approved = false) : (approved = true);


    //entry create in DB

    const profileDetails = await Profile.create({
        gender:null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
    });

    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        accountType: accountType,
        approved: approved,
        additionalDetails: profileDetails._id,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastName}`,                            
    });

    //return response
    return res.status(200).json({
        succes:true,
        message:"User is registered successfully",
        user,
    });

    }
    catch(error){
        console.log("error=> ",error);
        return res.status(500).json({
            succes:false,
            message:"User cannot be registered. Please try again",
        });

    }

    

};                                   


//login
exports.login = async (req, res) => {

    try{
    //get data from req body
    const {email, password} = req.body;

    //validation data
    if(!email || !password){
        return res.status(403).json({
            succes:false,
            message:"All fields are required, please try again",
        });
    }

    //user check exist or not
    const user = await User.findOne({email}).populate("additionalDetails");
    if(!user){
        return res.status(401).json({
            succes:false,
            message:"User is not registered, Please Signup first",
        });
    }

    //generate JWT, after pasword matching
    if(await bcrypt.compare(password, user.password)){

        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });
        user.token = token;
        user.password = undefined;

        //create cookie and send response
        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            //3 days
            httpOnly:true,
        }
        res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            user,
            message: 'Logged in Successfully',
        });

    } else {
        return res.status(401).json({
            succes:false,
            message:"Password is incorrect",
        });
    }

    }catch(error){
        console.log(error);
        return res.status(500).json({
            succes:false,
            message:"Login Failure, please try again",
        });
    }
    


}


//changePassword
exports.changePassword = async(req, res) => {

try{
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id);

    //Get old  password, newpassword, and confirm new password from req.body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
    );

    if (!isPasswordMatch) {
        // If old password does not match, return a 401 (Unauthorized) error
        return res
            .status(401)
            .json({ success: false, message: "The password is incorrect" });
    }
    //Match newpassword and confirm new password
    //validation
    if(newPassword !== confirmNewPassword)
    {
        return res.status(403).json({
            success:false,
            message:"Please Enter Same Password",
        });
    }

    //update password in DB
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findOneAndUpdate( 
        req.user.id,
        {
            password: hashedPassword,
        },
        {
            new:true,
        });

    //Send notification email
    try {
        const emailResponse = await mailSender(
            updatedUserDetails.email,
            passwordUpdated(
                updatedUserDetails.email,
                `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
            )
        );
        console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while sending email",
            error: error.message,
        });
    }


    //return response
    return res.status(200).json({
        success:true,
        message:"You have changed password successfully",
    });
} catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
    });
}

};




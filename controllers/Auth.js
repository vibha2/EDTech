const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//sendOTP
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
            result = await OTP.findOne({otp: otp});
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
        })



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
    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    console.log("recentOtp=> ",recentOtp);

    if(recentOtp.length == 0)
    {
        //OTP not found
        return res.status(400).json({
            succes:false,
            message:"OTP not found",
        });
    } else if(otp !== recentOtp.otp){

        //Invalid OTP
        return res.status(400).json({
            succes:false,
            message:"Invlid OTP",
        });
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

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
        accountType,
        additionalDetails: profileDetails._id,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastName}`,                            
    })

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

    

}                                   


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
    
    //get data from req body
    const {email} = req.body;

    if(!email){
        return res.status(403).json({
            success:false,
            message:"Please Enter Email Address",
        });
    }

    //get oldPassword, newPassword, confirmPassword
    const {oldPassword, newPassword, confirmPassword} = req.body;

    //validation
    if(newPassword == confirmPassword)
    {
        return res.status(403).json({
            success:false,
            message:"Please Enter Same Password",
        });
    }

    //update password in DB
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate( {email: email},
        {
            password: hashedPassword,
        },
        {
            new:true,
        });

    //send mail - Password updated
    await mailSender(email,
        "Password Changed",
        `Password Changed Successfully`);


    //return response
    return res.status(200).json({
        success:true,
        message:"You have changed password successfully",
    });


}




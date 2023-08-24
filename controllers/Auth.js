const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");

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
        console.log("otpPayload=> ", otpPayload);

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

    //find most recent otp tored fro the user
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

//changePassword




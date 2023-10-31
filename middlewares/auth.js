const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async(req, res, next) => {
    try{
        //extract token
        const token = req.cookies.token 
                        || req.body.token   
                        || req.header("Authorisation").replace("Bearer ","");
        
        //if token missing, then return resonse
        if(!token){
            return res.status(401).jon({
                success:false,
                message: 'Token is mising',
            })
        }

        //verify the token 
        try{
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(err){
            //verification issue
            return res.status(401).json({
                success: false,
                message: 'token is invalid',
            });
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success: false,
            message: 'Something went wrong while validating the token',
        });

    }
}

//isStudent
exports.isStudent = async(req, res, next) => {
    try{
        if(req.user.accountType !== "Student"){
            return res.tatus(401).json({
                success:false,
                message:'This is a protected route for Students only',
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again',
        });
    }
}

//isInstructor
exports.isInstructor = async(req, res, next) => {
    try{
        if(req.user.accountType !== "Instructor"){
            return res.tatus(401).json({
                success:false,
                message:'This is a protected route for Instructor only',
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again',
        });
    } 
}

//isAdmin
exports.isStudent = async(req, res, next) => {
    try{
        if(req.user.accountType !== "Admin"){
            return res.tatus(401).json({
                success:false,
                message:'This is a protected route for Admin only',
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again',
        });
    } 
}
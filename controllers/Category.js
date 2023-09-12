const Category = require("../models/category");

//create tag ka handler function

exports.createCategory = async(req,res) => {
    try{
        //fetch data
        const {name, description} = req.body;

        //validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        //create entry in DB
        const categoryDetails = await Category.create({
            name:name,
            description:description,
        });
        console.log("categoryDetails=> ",categoryDetails);

        //return response
        return res.status(200).json({
            success:true,
            message:"Category Created Successfully",
        });


    }catch(error){
        return res.statu(500).json({
            success:false,
            message:error.message,
        })
    }
};

//getAlltags handler function

exports.showAllcategory = async(req, res) => {
    try{
        const allCategory = await Category.find({}, {name:true, descripion:true});
        res.status(200).json({
            success:true,
            message:"All category returned Successfully",
            allCategory,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};
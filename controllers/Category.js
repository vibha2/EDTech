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

//category page details
//using this we can find, most popular coures, top course,
//frequently bough together courses 

exports.categoryPageDetails = async(req, res) => {
    try{
        //get category id
        const {categoryId} = req.body;

        //get courses for specified category id
        const selectedCategory = await Category.findById(categoryId)
                            .populate("courses") 
                            .exec();
        
        //validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message: 'Data Not Found',
            });
        }

        //get courses for different category
        const differentCategories = await Category.find({
                                    _id: {$ne: categoryId},
                                 })
                                 .populate("courses")
                                 .exec();
        let differentCourses =[];
        for(const category of categoriesExceptSelected)
        {
            differentCourses.push(...category.courses);
        }

        //get top selling courses
        //if we have a count that which course is sold how many times so on this basis we can sort thr courses.
       const allCategories = await Category.find().populate("courses");
       const allCourses = allCategories.flatMap((category) => category.courses);
       const mostSellingCourses = allCourses
            .sort((a,b) => b.sold - a.sold)
            .slice(0,10);
       
        //return response
        return res.status(200).json({
            success: true,
            data: {
                selectedCategory: selectedCategory,
                differentCategories: differentCategories,
                mostSellingCourses: mostSellingCourses,
            }
        })

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:error.message,
        });
    }
}
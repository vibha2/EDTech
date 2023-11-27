const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async(req, res) => {
    try{
        //data fetch
        const {sectionName, courseId} = req.body;

        //data validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success:false,
                message:'Missing required Properties',
            });
        }

        //create section
        const newSection = await Section.create({ sectionName });

        //update course with section ObjectID
        // Add the new section to the course's content array
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id
                }
            },
            {
                new:true
            },
        )
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();
        
        //h.w: use populate to replace section/sub-sections both in updatedCourseDetails
        console.log("updatedCourseDetails=> ",updatedCourseDetails)
        
        //return response
        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourseDetails
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to create section, please try again',
            error:error.message,
        });

    }
}

//update section
exports.updateSection = async (req, res) => {
    try{
        //data input
        const { sectionName, sectionId} = req.body

        //data validation
        if(!sectionName || !sectionId)
        {
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }

        //update data
        const section = await Section.findByIdAndUpdate(
            sectionId,
            {
                sectionName
            },
            {
                new:true
            },
        );

        //return res
        return res.status(200).json({
            success:true,
            message:'Section updated successfully',
            section
        });

    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'Unable to create section, please try again',
            error:error.message,

        });
    }
}

//deleteSection
exports.deleteSection = async(req, res) => {
    try{
        //get id - assuming that we're ending id in params
        const {sectionId} = req.params;

        //use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);
        //HW-> Course ko bh update kro
        //TODO: do we need to delete the entry from the course schema??
        //return response
        return res.status(200).json({
            success:true,
            message:'Section Deleted Successfully',
        });
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'Unable to delete section, please try again',
            error:error.message,

        });
    }
}

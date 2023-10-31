const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
// const { findByIdAndUpdate } = require("../models/Course");

//create SubSection

exports.createSubSection = async(req, res) => {
    try{
        //fetch data from req body
        const {sectionId, title, timeDuration, description} = req.body;

        //extract file/video
        const video = req.files.videoFile;

        //validation
         if(!sectionId || !title || !timeDuration || !description || !video )
         {
             return res.status(400).json({
                 success:false,
                 message:'All field are required',
             });
         }

        //upload video to cloudinary
        const uploadeDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME );

        //create a sub-section
        const SubSectionDetails = await SubSection.create({
            title:title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadeDetails.secure_url,
        });

        //update section with sub-section ObjectId
        const updatedSection = await findByIdAndUpdate( 
            {
                _id:sectionId
            },
            {
                $push: {
                    subSection:SubSectionDetails._id,
                }
            },
            {
                new:true
            }
        );
        //HW: log updated section here, after adding populate query

        //return response
        return res.status(200).json({
            success:true,
            message:'Sub Section Created Successfully',
            updatedSection,
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

//updatesubsection
exports.updateSubsection = async(req, res) => {
    try
    {
        //fetch data
        const {SubSectionId, title, timeDuration, description} = req.body;

        //validation
         if(!SubSectionId || !title || !timeDuration || !description  )
         {
             return res.status(400).json({
                 success:false,
                 message:'All field are required',
             });
         }

         //find subsection id and update
         const updateSubSection = await SubSection.findByIdAndUpdate(
            {
                SubSectionId,
            },
            {
                title:title,
                timeDuration:timeDuration,
                description:description,
            },
            {
                new:true,
            }
         );

        //return res
        return res.status(200).json({
            success:true,
            message:'SubSection updated successfully',
            updateSubSection
        });


    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'Unable to update subsection, please try again',
            error:error.message,

        });
    }
}

//deletesubsection
exports.deleteSubSection = async(req, res) => {
    try{
        //get id - assuming that we 're sending id in params
        const {SubSectionId} = req.params;

        //use findByIdAndDelete
        await SubSection.findByIdAndDelete(SubSectionId);

        //return response
        return res.status(200).json({
            success:true,
            message:'SubSection Deleted Successfully',
        });
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'Unable to delete subsection, please try again',
            error:error.message,

        });
    }
}


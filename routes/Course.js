const express = require("express");
const router = express.Router();

const {createCourse, showAllCourses, getCourseDetails } = require("../controllers/Course");

router.post("/createCourse", createCourse );
router.get("/showAllCourses", showAllCourses);
router.get("/getCourseDetails", getCourseDetails);


module.exports = router;
const express = require("express");
const router = express.Router();

const { sendOTP, signUp, login, changePassword } = require("../controllers/Auth");
const {auth, isStudent, isInstructor, isAdmin } = require("../middlewares/auth");

router.get("/Student", auth, isStudent, (req, res) => {
    res.json({
        success:true,
        message: 'Welcome to Protected route for Student'
    });
});

router.get("/Instructor", auth, isInstructor, (req, res) => {
    res.json({
        success:true,
        message: 'Welcome to Protected route for Instructor'
    });
});

router.get("/Admin", auth, isAdmin, (req, res) => {
    res.json({
        success:true,
        message: 'Welcome to Protected route for Admin'
    });
});

router.put("/signup", signUp);
router.get("/login", auth, login);

module.exports = router;
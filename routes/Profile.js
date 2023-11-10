const express = require("express");
const router = express.Router();

const {updateProfile, deleteAccount, getAllUserDetails } = require("../controllers/Profile");

router.put("/updateProfile", updateProfile);
router.delete("/deleteAccount", deleteAccount);
router.get("/getAllUserDetails", getAllUserDetails);


module.exports = router;
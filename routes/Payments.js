const express = require("express");
const router = express.Router();

const { capturePayment, verifySignature } = require("../controllers/Payments");

router.put("/capturePayment", capturePayment);

module.exports = router;
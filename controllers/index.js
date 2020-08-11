const express = require("express");
const router = express.Router();

// page
router.use("/", require("./page"))

// api
router.use("/images", require("./image"))
router.use("/data", require("./data"))

module.exports = router;
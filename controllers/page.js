const express = require("express");
const router = express.Router();
const path = require("path");
const root_dir = path.dirname(require.main.filename)

router.get("/", function (req, res) {
    res.sendFile(path.join(root_dir + "/views/index.html"))
})
router.get("/image", function (req, res) {
    res.sendFile(path.join(root_dir + "/views/image.html"))
})
router.get("/data", function (req, res) {
    res.sendFile(path.join(root_dir + "/views/data.html"))
})

module.exports = router;
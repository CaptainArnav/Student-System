const express = require("express");
const router = express.Router();
const driver = require('../config/db');

router.get('/', async(req, res) => {

    })
    //for future routes
    // router.use('/register', require("./register"));
router.use("/users", require("./users"));
router.use("/search", require("./search"));
router.use("/profile", require("./profile"));
router.use("/library", require("./library"));
router.use("/hostel", require("./hostel"));

module.exports = router;
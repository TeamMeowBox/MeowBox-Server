/*
 Default module
*/
const express = require('express');
const router = express.Router();


// Signin
// router.use('/main', require('./main'));

router.use('/monthlyBox_detail', require('./monthlyBox_detail'));

module.exports = router;

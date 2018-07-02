/*
 Default module
*/
const express = require('express');
const router = express.Router();


// Signin
// router.use('/main', require('./main'));

// Order Page
router.use('/order_page', require('./order_page'));



module.exports = router;

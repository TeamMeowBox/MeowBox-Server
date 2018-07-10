/*
 Default module
*/
const express = require('express');
const router = express.Router();


// Signin
// router.use('/main', require('./main'));

// Order Page
router.use('/order_page', require('./order_page.js'));

//Order detail
router.use('/order_detail', require('./order_detail.js'));

// //Order List
router.use('/order_list', require('./order_list.js'));

// Order Result
router.use('/order_result', require('./order_result.js'));


///////

module.exports = router;

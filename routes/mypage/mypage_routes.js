/*
 Default module
*/
const express = require('express');
const router = express.Router();


// Signin
// router.use('/main', require('./main'));
router.use('/', require('./account_setting'));



module.exports = router;

/*
 Default module
*/
const express = require('express');
const router = express.Router();

// Signin
router.use('/', require('./main'));

// Crawling
//router.use('/crawling', require('./crawling'));



module.exports = router;

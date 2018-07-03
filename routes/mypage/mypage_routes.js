/*
 Default module
*/
const express = require('express');
const router = express.Router();


router.use('/', require('./mypageinfo'));
router.use('/feedback', require('./feedback'));



module.exports = router;

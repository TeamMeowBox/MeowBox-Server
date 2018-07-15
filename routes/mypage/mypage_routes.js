/*
 Default module
*/
const express = require('express');
const router = express.Router();


router.use('/qna', require('./qna'));
router.use('/account_setting', require('./account_setting'));
router.use('/mypageinfo', require('./mypageinfo'));
router.use('/feedback', require('./feedback'));


module.exports = router;

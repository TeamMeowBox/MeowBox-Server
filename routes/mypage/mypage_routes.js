/*
 Default module
*/
const express = require('express');
const router = express.Router();


router.use('/', require('./mypageinfo'));



module.exports = router;

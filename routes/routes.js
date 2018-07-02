/*
 Default module
*/
const express = require('express');
const router = express.Router();

// Default
router.use('/', require('./default/comman'));

module.exports = router;

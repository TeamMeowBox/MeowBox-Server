/*
 Default module
*/
const express = require('express');
const router = express.Router();



// Signin
router.use('/', require('./main'));



module.exports = router;

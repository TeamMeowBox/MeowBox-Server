/*
 Default module
*/
const express = require('express');
const router = express.Router();


// Signin
// router.use('/main', require('./main'));
//router.get('/',(req,res)=>{  res("OK"); })  //몽고 디비 깔기전까지 라우터연결시킬 경로(나중에 지움) -경인 
router.use('/monthlyBox_detail', require('./monthlyBox_detail'));
router.use('/instagram', require('./instagram'));

module.exports = router;

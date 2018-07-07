/*
 Default module
*/
const express = require('express');
const router = express.Router();


// Signin
// router.use('/main', require('./main'));
//router.get('/',(req,res)=>{  res("OK"); })  //몽고 디비 깔기전까지 라우터연결시킬 경로(나중에 지움) -경인 
router.use('/monthlyBox_detail', require('./monthlyBox_detail'));
<<<<<<< HEAD
router.use('/instagram', require('./instagram'));

=======
>>>>>>> e4436e1b1855bd21169b0a5c8a8bb64afc979cac
module.exports = router;

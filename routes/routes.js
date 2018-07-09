/*
 Default module
*/
const express = require('express');
const router = express.Router();

router.use('/user', require('./user/user_routes'));
router.use('/order', require('./order/order_routes'));
router.use('/mypage', require('./mypage/mypage_routes'));
router.use('/home', require('./home/home_routes'));
router.use('/test',require('./testTransaction'))

module.exports = router;

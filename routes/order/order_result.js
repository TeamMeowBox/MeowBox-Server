const express = require('express');
const router = express.Router();

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt');

const moment = require('moment')



router.get('/', async (req, res, next) => {
console.log("123");
let imp_success = req.query.imp_success;
  //  let {imp_uid, merchant_uid, imp_success} = req.params;
    console.log('img_success : ' + imp_success);
    res.send("End");
});




module.exports = router;

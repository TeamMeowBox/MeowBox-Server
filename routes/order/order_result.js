const express = require('express');
const router = express.Router();

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt');

const moment = require('moment')



router.get('/:imp_uid/:merchant_uid/;imp_success', async (req, res, next) => {
    let {imp_uid, merchant_uid, imp_success} = req.params;
    console.log('img_uid : ' + img_uid);
    res.send("End");
});




module.exports = router;

const express = require('express');
const router = express.Router();

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt');


// Written By 신기용
// iOS 주문결제시 호출 
router.get('/', async (req, res, next) => {
    let imp_uid = req.query.imp_uid;
    let imp_success = req.query.imp_success;
    let merchant_uid = req.query.merchant_uid; // 69_1298391283 이런 형식으로 옴
    console.log('merchant_uid : ' + merchant_uid);
    merchant_uid = merchant_uid.split("_");

    let cat_idx = merchant_uid[0];
    let random_key = merchant_uid[1];
    console.log('cat_idx : ' + cat_idx);
    console.log('random_key : ' + random_key);



    let selectUserIdxQuery=
    `
    SELECT user_idx
    FROM cats
    WHERE idx = ?
    `

    try{
        let selectUserIdxResult = await db.Query(selectUserIdxQuery,[cat_idx]);
        if( selectUserIdxResult.length == 0){
            return next(400);
        }
        let user_idx = selectUserIdxResult[0].user_idx;

        let orderResultInsertQuery =
        `
        INSERT INTO order_result(user_idx,random_key)
        VALUES(?,?)
        `
        
        let orderResultInsertResult = await db.Query(orderResultInsertQuery, [user_idx,random_key]);
    }catch(error){
        return next(error);
    }

    // Web상으로 성공 이미지 보여준다
    res.render('order_success');
});


// Written By 신기용
// iOS 결제 유무 체크 
router.post('/check_order', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);
    if (chkToken  == undefined) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }

    let {random_key} = req.body;

    let selectOrderHistoryQuery =
    `
    SELECT *
    FROM order_result
    WHERE user_idx = ? AND random_key = ?
    `

    console.log('user_idx : ' + chkToken.user_idx );
    console.log('random_key : ' + random_key);

    let result = {};
    try{
        let selectOrderHistoryResult = await db.Query(selectOrderHistoryQuery,[chkToken.user_idx, random_key]);
        result.order_result = selectOrderHistoryResult.length == 0 ? false : true;

    }catch(error){
        return next(error);
    }

    return res.r(result);
});





module.exports = router;

const express = require('express');
const router = express.Router();

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt');

const axios = require('axios')
const request = require('request');

const pool = require('../../config/dbPool');

var token = "90f0c2671d03ac252688344d34b18cb75dbbbe81"
// var token = "cecb2d95f1f918d9746458a36105148fca1df3a4"

 
function preOrder(merchant_uid, amount){ // code  0 : success / 1 : fail
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err, connection){
            if(err) reject(err);
            else {
                // Set the headers
                var headers = {
                    'Content-Type':     'application/json'
                }
                // Configure the request
                var options = {
                    url: `https://api.iamport.kr/payments/prepare?_token=${token}`,
                    method: 'POST',
                    headers: headers,
                    form: {'merchant_uid': merchant_uid, 'amount': amount }
                }

                // Start the request
                request(options, function (err, response, body) {
                    connection.release();
                    if( err ){
                        reject(err);
                    }
                    else if (response.statusCode == 200) {
                        resolve(body)
                    }
                }) // end of request              
            }
        });
    }); // end of Promise
}; // end of preOrder ()

    
function afterOrder(merchant_uid){ // code   0 : success /   -1 : fail
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err, connection){
            if(err) reject(err);
            else {
                var call = {
                    uri: 'https://api.iamport.kr/payments/prepare/'+ merchant_uid + '?_token=' + `${token}`,
                    method: 'GET'
                }

                request(call, function (err, response) {
                    connection.release();
                    if( err ){
                        reject(err);
                    }
                    else if (response.statusCode == 200) {
                        resolve(response.body)
                    }
                }); // end of request
            } // end of else
        });
    }); // end of Promise
}; // end of afterOrder ()



// Written By 신기용
router.get('/', async (req, res, next) => {
    try {
        let imp_uid = req.query.imp_uid;
        let imp_success = req.query.imp_success;
        let merchant_uid = req.query.merchant_uid; 

        if(! imp_success ){
            return res.render('order_fail');
        }

        console.log('imp_uid : ' + imp_uid);
        console.log('imp_success : ' + imp_success);
        console.log('merchant_uid : ' + merchant_uid);

        console.log(' To Access token ');
        // 액세스 토큰(access token) 발급 받기
        getToken = await axios({
            url: "https://api.iamport.kr/users/getToken",
            method: "post", // POST method
            headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
            data: {
                imp_key: "7887838073153140", // REST API키
                imp_secret: "1jtwZfvM7ouZLk2wHb74jw7LoZKOb1Acl4Jkjf7rDBqoVtVDE2IYzPKXOuL0wmcRrWcLbjcOVDdQ68tL" // REST API Secret
            }
        });

        token = getToken.data.response.access_token;

        console.log('token : ' + token);


        let getAmountQuery = 
        `
        SELECT user_idx, price
        FROM orders
        WHERE idx = ? 
        `

        let getAmountResult = await db.Query(getAmountQuery,[merchant_uid]);

        let preOrderResult = await preOrder(merchant_uid, getAmountQuery[0].price);
        preOrderResult = JSON.parse(preOrderResult);
        console.log('preOrderResult.code : ' + preOrderResult.code);

        let afterOrderResult = await afterOrder(merchant_uid);
        afterOrderResult = JSON.parse(afterOrderResult);
        console.log('afterOrderResult.code : ' + afterOrderResult.code);

        if( afterOrderResult.code == 0) {
            let orderResultInsertQuery =
            `
            INSERT INTO order_result(user_idx, imp_uid, merchant_uid )
            VALUES(?,?,?)
            `
            await db.Query(orderResultInsertQuery, [getAmountResult[0].user_idx, imp_uid, merchant_uid]);

            return res.render('order_success');
        }
        else {
            return res.render('order_fail');
        }

    } catch(error){
        return next(error);
    }
});




// Written By 신기용
// APP 결제 유무 체크 
router.post('/check_order', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);
    if (chkToken  == undefined) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }

    let {merchant_uid} = req.body;

    let selectOrderHistoryQuery =
    `
    SELECT *
    FROM order_result
    WHERE user_idx = ? AND merchant_uid = ? AND used = FALSE;
    `

    let result = {};
    try{
        let selectOrderHistoryResult = await db.Query(selectOrderHistoryQuery,[chkToken.user_idx, merchant_uid]);
        result.order_result = selectOrderHistoryResult.length == 0 ? false : true;
        if( result.order_result ){
            let updateUsedQuery = 
            `
            UPDATE order_result
            SET used = TRUE;
            WHERE user_idx = ?
            `
            await db.Query(updateUsedQuery,[chkToken.user_idx]);
        }
    }catch(error){
        return next(error);
    }

    return res.r(result);
});





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
    return res.render('order_success');
});




module.exports = router;

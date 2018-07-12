const express = require('express');
const router = express.Router();

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt');

const axios = require('axios')
const request = require('request');

const pool = require('../../config/dbPool');

 
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
// App 용
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

        let token = getToken.data.response.access_token;
        console.log('IMP token : ' + token);

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


/*
Method : Post
*/


// Written By 신기용
// Web 용
router.post('/web', async (req, res, next) => {
    try {
        const chkToken = jwt.verify(req.headers.authorization);

        if (chkToken  == undefined) {
            return next("10403"); // "description": "잘못된 인증 방식입니다.",
        }
    
        let {imp_uid,imp_success,merchant_uid} = req.body;

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

        let token = getToken.data.response.access_token;
        console.log('IMP token : ' + token);


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


        let result = {};
        if( afterOrderResult.code == 0) {
            let orderResultInsertQuery =
            `
            INSERT INTO order_result(user_idx, imp_uid, merchant_uid )
            VALUES(?,?,?)
            `
            db.Transaction(async (connection) => {
            await connection.query(orderResultInsertQuery, [getAmountResult[0].user_idx, imp_uid, merchant_uid]);

            
            let selectOrderHistoryQuery =
            `
            SELECT count(*) as cnt
            FROM order_result
            WHERE user_idx = ? AND merchant_uid = ? AND used = FALSE;
            `

            let selectOrderHistoryResult = await connection.query(selectOrderHistoryQuery,[chkToken.user_idx, merchant_uid]);

            console.log('selectOrderHistoryResult.cnt : ' + selectOrderHistoryResult[0].cnt);
            
            result.order_result = selectOrderHistoryResult[0].cnt == 0 ? false : true;
            
            if( result.order_result ){
            
                let updateUsedQuery = 
                `
                UPDATE order_result
                SET used = 1
                WHERE merchant_uid = ?
                `
                await connection.query(updateUsedQuery,[merchant_uid]);
            }
        
            }).catch(error => {
                return next(error)
            }) // end of catch()
        
        }else {
            result.order_result = false;
        }  
    } // end of Try
    catch(error){
        return next(error);
    }
    return res.r(result);
});



// Written By 신기용
// APP 결제 유무 체크 
router.post('/check_order', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);

    if (chkToken  == undefined) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }

    let {merchant_uid} = req.body;

    console.log('user_idx : ' + chkToken.user_idx);
    console.log('merchant_uid : ' + merchant_uid);
    

    let selectOrderHistoryQuery =
    `
    SELECT count(*) as cnt
    FROM order_result
    WHERE user_idx = ? AND merchant_uid = ? AND used = FALSE;
    `

    let result = {};
    try{
        let selectOrderHistoryResult = await db.Query(selectOrderHistoryQuery,[chkToken.user_idx, merchant_uid]);

        console.log('selectOrderHistoryResult.cnt : ' + selectOrderHistoryResult[0].cnt);
        result.order_result = selectOrderHistoryResult[0].cnt == 0 ? false : true;
        if( result.order_result ){
            let updateUsedQuery = 
            `
            UPDATE order_result
            SET used = 1
            WHERE merchant_uid = ?
            `
            await db.Query(updateUsedQuery,[merchant_uid]);
        }
    }catch(error){
        return next(error);
    }

    return res.r(result);
});



module.exports = router;

const express = require('express');
const router = express.Router();

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt');

const axios = require('axios')
const request = require('request');

const pool = require('../../config/dbPool');
var token;

function yyyymmdd(dateIn) {
    let array = [];
    var yyyy = dateIn.getFullYear();
    var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
    if (mm < 10) { mm = '0' + mm; }
    var dd = dateIn.getDate();
    if (dd < 10) { dd = '0' + dd; }
    array.push(String(yyyy + mm + dd));
    array.push(String(yyyy + '.' + mm + '.' + dd));
    return array;
}

//다음주의 원하는 요일 구하는 함수(한주의 시작을 월요일로 가정)
function getNextDayofWeek(date, dayOfWeek) {

    //var resultDate = new Date(date.getTime());
    var resultDate = moment(date)
    var day = moment(resultDate).day() === 0 ? 7 : moment(resultDate).day();
    //resultDate.setDate(resultDate.getDate() + (dayOfWeek + 7 - day));
    resultDate = moment(resultDate).add(dayOfWeek + 7 - day, 'day')
    console.log(resultDate)
    //console.log("resultDate : "+resultDate+"  "+resultDate.getDay())

    return moment(resultDate);
}

//달의 첫번째 월요일을 구하는 함수
function getFirstMonday(date) {
    var date = moment(date).startOf('month')
    while (moment(date).day() !== 1) {
        //date.setDate(date.getDate()+1)
        date = moment(date).add(1, 'd')
    }

    return date
}

//배송일 리스트 구하는 함수
function getDeliveryDate(payment_date, product) {
    var deliveryDate = new Array();
    if (product == 3 || product == 6) {
        for (let i = 0; i < product; i++) {
            if (i == 0) {
                let firstDate = getNextDayofWeek(payment_date, 1)
                //delivertDate.push(getNextDayofWeek(payment_date,1))
                if (moment(firstDate).month() > moment(payment_date).month()) {
                    deliveryDate.push(moment(firstDate).format('YYYY.MM.DD'))
                    i++;
                }
                deliveryDate.push(moment(firstDate).format('YYYY.MM.DD'))
            } else {
                let testDate = moment(payment_date).add(i, 'M')
                deliveryDate.push(getFirstMonday(testDate).format('YYYY.MM.DD'))
            }
        }
    } else {
        console.log('qwerqwerqwer');
        let testDate = getNextDayofWeek(payment_date, 1)
        console.log('asdfasdfaasdf');
        deliveryDate.push(moment(testDate).format('YYYY.MM.DD'))
        console.log('zxcvzxcvzxcv');
    }

    return deliveryDate
}




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
// [7.13] 주문은 했으나 결제가 안됐을 경우 
router.get('/', async (req, res, next) => {
    try {
        let imp_uid = req.query.imp_uid;
        let imp_success = req.query.imp_success;
        let merchant_uid = req.query.merchant_uid; 

        imp_uid = 1
        imp_success = 2
        merchant_uid = 2

	
        if( imp_success == "false" ){
		console.log('imp_success is fail ');
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
        console.log('IMP token : ' + token);

        let getAmountQuery = 
        `
        SELECT user_idx, price
        FROM pre_orders
        WHERE idx = ?
        `

        let getAmountResult = await db.Query(getAmountQuery,[merchant_uid]);

        console.log('getAmountResult : ' + getAmountResult[0].user_idx);

        /*

        let preOrderResult = await preOrder(merchant_uid, getAmountResult[0].price);
        preOrderResult = JSON.parse(preOrderResult);
        console.log('preOrderResult.code : ' + preOrderResult.code);

        let afterOrderResult = await afterOrder(merchant_uid);
        afterOrderResult = JSON.parse(afterOrderResult);
        console.log('afterOrderResult.code : ' + afterOrderResult.code);

        */


        // if( afterOrderResult.code == 0) {
        if( true ) {
            let orderResultInsertQuery =
            `
            INSERT INTO order_result(user_idx, imp_uid, merchant_uid )
            VALUES(?,?,?)
            `
            await db.Query(orderResultInsertQuery, [getAmountResult[0].user_idx, imp_uid, merchant_uid]);

            console.log(' orderResultInsertQuery selectQuery ');


            let selectQuery = 
            `
            SELECT *
            FROM pre_orders
            WHERE user_idx = ?
            ORDER BY user_idx DESC
            `

            let selectResult = await db.Query(selectQuery,[getAmountResult[0].user_idx]);

            console.log(' after selectQuery ');



            let payment_date = [];
            payment_date = yyyymmdd(new Date());
            console.log('payment_date : ' + payment_date);

            console.log('selectResult[0].product : ' + selectResult[0].product);

            let deliveryList = getDeliveryDate(payment_date[0], selectResult[0].product);
            console.log('123123121312312');
            let end_date = deliveryList[deliveryList.length-1]
            console.log('deliveryList : ' + deliveryList);





            let deleteQuery =
            `
            DELETE FROM pre_orders
            WHERE user_idx = ?
            `
            await db.Query(deleteQuery,[getAmountResult[0].user_idx]);

            console.log(' after deleteQuery ');


            let insertQuery =
            `
            INSERT INTO orders (user_idx, name, address, phone_number, email, payment_date, end_date,price, product, payment_method)
            VALUES(?,?,?,?,?,?,?,?,?,?);
            `;
            await db.Query(insertQuery, [getAmountResult[0].user_idx, selectResult[0].name, selectResult[0].address, selectResult[0].phone_number, selectResult[0].email, payment_date[1], end_date, selectResult[0].price, selectResult[0].product, selectResult[0].payment_method]);

            console.log(' after insertQuery ');
        
            insertQuery =
            `
            INSERT INTO reservations (order_idx, delivery_date)
            VALUES(?,?);
            `;
        
            for (var i in deliveryList) {
                console.log('deliveryList : ' + deliveryList[i]);
                db.Query(insertQuery, [ result.order_idx, deliveryList[i]]);
            } // end of For

            return res.render('order_success');
        } // end of If 
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

        token = getToken.data.response.access_token;
        console.log('IMP token : ' + token);


        let getAmountQuery = 
        `
        SELECT user_idx, price
        FROM orders
        WHERE idx = ? 
        `

        let getAmountResult = await db.Query(getAmountQuery,[merchant_uid]);

        let preOrderResult = await preOrder(merchant_uid, getAmountResult[0].price);
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

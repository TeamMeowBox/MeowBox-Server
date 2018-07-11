const express = require('express');
const router = express.Router();

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt');

var axios = require('axios')




// Written By 신기용
router.get('/', async (req, res, next) => {
    try {
        let imp_uid = req.query.imp_uid;
        let imp_success = req.query.imp_success;
        let merchant_uid = req.query.merchant_uid; 

        console.log('imp_uid : ' + imp_uid);
        console.log('imp_success : ' + imp_success);
        console.log('merchant_uid : ' + merchant_uid);


        console.log(' Before Access token ');
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
        const { access_token } = getToken.data.response; // 인증 토큰

        console.log('access_token : ' + access_token);


        console.log(' Before Get getPaymentData ');
        // imp_uid로 아임포트 서버에서 결제 정보 조회
        const getPaymentData = await axios({
            url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
            method: "get", // GET method
            headers: { "Authorization": access_token } // 인증 토큰 Authorization header에 추가
        });
        const paymentData = getPaymentData.data.response; // 조회한 결제 정보
        console.log('paymentData : ' + paymentData);
         

        let selectAmountQuery=
        `
        SELECT price
        FROM orders
        WHERE idx = ?
        `
        

        //  const order = await Orders.findById(paymentData.merchant_uid);
        //  const amountToBePaid = order.amount; // 결제 되어야 하는 금액

        // DB에서 결제되어야 하는 금액 조회
         const amountToBePaid = await db.Query(selectAmountQuery,[merchant_uid]);

        console.log('amountToBePaid : ' + amountToBePaid[0].price);
 
         // 결제 검증하기
         const { amount, status } = paymentData;
         console.log('amount : ' + amount);
         if (amount === amountToBePaid[0].price){
             console.log(' 3개 ===');
         }

         if (amount == amountToBePaid[0].price){
            console.log(' 2개 ===');
        }

         if ( amount === amountToBePaid[0].price || amount === amountToBePaid[0].price) { // 결제 금액 일치. 결제 된 금액 === 결제 되어야 하는 금액
            //  await Orders.findByIdAndUpdate(merchant_uid, { $set: paymentData }); // DB에 결제 정보 저장

            console.log('status : ' + status);
 
             switch (status) {
                 case "ready": // 가상계좌 발급
                     // DB에 가상계좌 발급 정보 저장
                     const { vbank_num, vbank_date, vbank_name } = paymentData;
                     await Users.findByIdAndUpdate("/* 고객 id */", { $set: { vbank_num, vbank_date, vbank_name }});
                     // 가상계좌 발급 안내 문자메시지 발송
                     SMS.send({ text: `가상계좌 발급이 성공되었습니다. 계좌 정보 ${vbank_num} ${vbank_date} ${vbank_name}`});
                     res.send({ status: "vbankIssued", message: "가상계좌 발급 성공" });
                     break;
                 case "paid": // 결제 완료
                     res.send({ status: "success", message: "일반 결제 성공" });
                     break;
             }
         } else { // 결제 금액 불일치. 위/변조 된 결제
             throw { status: "forgery", message: "위조된 결제시도" };
         }
    } catch (e) {
        res.status(400).send(e);
    }

    return res.render('order_success');

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





module.exports = router;

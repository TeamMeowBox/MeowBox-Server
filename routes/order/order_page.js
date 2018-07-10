/*
 Declare module
 */
const express = require('express');
const router = express.Router();
const _crypto = require('crypto');
const async = require('async');
const moment = require('moment');
const bodyParser = require('body-parser');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
const secretKey = require('../../config/secretKey').key;

/*
Method : Get
*/

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
        let testDate = getNextDayofWeek(payment_date, 1)
        deliveryDate.push(moment(testDate).format('YYYY.MM.DD'))
    }

    return deliveryDate
}

/*
Method : Get
*/

// Written By 권서연
// 주문 페이지(최근 배송지 가져오기)

router.get('/', async(req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);

    if (chkToken == undefined) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }
    let orderResult, result = {};
    let orderSelectQuery =
        `
    SELECT idx as order_idx, name, address, phone_number, email, payment_date, product
    FROM orders
    WHERE user_idx = ? 
    ORDER BY payment_date DESC
    `;

    try {
        orderResult = await db.Query(orderSelectQuery, [chkToken.user_idx]);

           
            if (orderResult.length === 0) {
                result.order_idx = -1;  // "description": "주문 내역이 존재하지 않습니다."
          } else {
                result.order_idx = orderResult[0].order_idx + "";
                result.name = orderResult[0].name;
                result.address = orderResult[0].address;
                result.phone_number = orderResult[0].phone_number;
                result.email = orderResult[0].email;
                result.payment_date = orderResult[0].payment_date;
          }
    } catch (error) {
        return next(error);
    }
    return res.r(result);
});




/*
Method : Post
*/

// Written By 신기용
// 주문 페이지(새로운 배송지 입력)
router.post('/', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);

    if (chkToken == undefined) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }

    let { email, product, name, address, phone_number, price, payment_method } = req.body;

    let payment_date = [];
    payment_date = yyyymmdd(new Date());

    let insertQuery =
        `
    INSERT INTO orders (user_idx, name, address, phone_number, email, payment_date, price, product, payment_method)
    VALUES(?,?,?,?,?,?,?,?,?);
    `;

    let result;
    try {
        let insertIdx = await db.Query(insertQuery, [chkToken.user_idx, name, address, phone_number, email, payment_date[1], price, product, payment_method]);

        console.log('insertIdx : ' + insertIdx.insertId);

        let deliveryList = getDeliveryDate(payment_date[0], product);
        insertQuery =
            `
        INSERT INTO reservations (order_idx, delivery_date)
        VALUES(?,?);
        `;
        console.log('deleveryList :' + deliveryList);

        if( product == 3 || product == 6){
            result = "1";
        }


        for (var i in deliveryList) {
            console.log(' i : ' + i);
            let a = deliveryList[i];
            console.log('a : ' + a);
            db.Query(insertQuery, [insertIdx.insertId, deliveryList[i]]);
        }
    } catch (error) {
        return next(error);
    }
    return res.r(result);
});

//정기권 3,6 이 중복되면 400에러 (정기권 진행중인지 모먼트로 검사하기)
router.get('/product', async (req, res, next) => {
    let { product } = req.query
    const chkToken = jwt.verify(req.headers.authorization);

    if (chkToken == undefined) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }

    let query = `
    select orders.product , reservations.*
    from reservations, orders
    where orders.user_idx  = ? AND orders.idx = reservations.order_idx
    order by reservations.delivery_date desc;
    `
    try {
        let Result = await db.Query(query, [chkToken.user_idx])

        if(product == 3 || product == 6){
            if(Result.length !== 0 && (Result[0].product == 3 ||Result[0].product == 6) )
            {
                return next("400")
            }
        }
    } catch (error) {
        return next(error)
    }
    return res.r();

})

module.exports = router;

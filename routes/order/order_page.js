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
    var mm = dateIn.getMonth()+1; // getMonth() is zero-based
    if(mm < 10){ mm = '0'+mm; }
    var dd  = dateIn.getDate();
    if( dd < 10){ dd = '0'+dd; }
    array.push(String(yyyy + mm + dd));
    array.push(String(yyyy + '.' + mm + '.' + dd));
    return array;
 }
 

 //다음주의 원하는 요일 구하는 함수(한주의 시작을 월요일로 가정)
function getNextDayofWeek(date,dayOfWeek){
	
	//var resultDate = new Date(date.getTime());
	var resultDate = moment(date)
	var day = moment(resultDate).day() === 0 ? 7 : moment(resultDate).day();
	//resultDate.setDate(resultDate.getDate() + (dayOfWeek + 7 - day));
	resultDate = moment(resultDate).add(dayOfWeek + 7 - day,'day')
	console.log(resultDate)
	//console.log("resultDate : "+resultDate+"  "+resultDate.getDay())

	return moment(resultDate);
}

//달의 첫번째 월요일을 구하는 함수
function getFirstMonday(date){
	var date = moment(date).startOf('month')
	while(moment(date).day() !== 1){
		//date.setDate(date.getDate()+1)
		date = moment(date).add(1,'d')
	}
	
	return date
}

//배송일 리스트 구하는 함수
function getDeliveryDate(payment_date,product){
    var deliveryDate = new Array();
    if(product == 3 || product == 6){
		for(let i = 0;i<product;i++){
			if(i==0){
                let firstDate = getNextDayofWeek(payment_date,1)
				//delivertDate.push(getNextDayofWeek(payment_date,1))
				if(moment(firstDate).month()>moment(payment_date).month()){
					deliveryDate.push(moment(firstDate).format('YYYY.MM.DD'))
					i++;
				}
				deliveryDate.push(moment(firstDate).format('YYYY.MM.DD'))
			} else {
				let testDate = moment(payment_date).add(i,'M')
				deliveryDate.push(getFirstMonday(testDate).format('YYYY.MM.DD'))
			}
		}
	} else {
		let testDate = getNextDayofWeek(payment_date,1)
		deliveryDate.push(moment(testDate).format('YYYY.MM.DD'))
	}

    return deliveryDate
}




/*
Method : Post
*/

// Written By 신기용
// 주문 페이지
router.post('/', async(req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);
    
    if (chkToken == undefined) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }

   let {user_idx,email, product, name, address, phone_number, price} = req.body;
 
   let payment_date = [];
   payment_date = yyyymmdd(new Date());

    let insertQuery = 
    `
    INSERT INTO orders (user_idx, name, address, phone_number, email, payment_date, price, product)
    VALUES(?,?,?,?,?,?,?,?);
    `;

    let result;
    try {
        let insertIdx = await db.Query(insertQuery,[ user_idx, name, address, phone_number, email, payment_date[1], price, product ]);

        console.log('insertIdx : ' + insertIdx.insertId);
    
        let deliveryList = getDeliveryDate(payment_date[0],product);
        insertQuery = 
        `
        INSERT INTO reservations (order_idx, delivery_date)
        VALUES(?,?);
        `;
        console.log('deleveryList :' +  deliveryList);


        for(var i in deliveryList ){
            console.log(' i : ' + i);
            let a = deliveryList[i];
            console.log('a : ' + a);
            db.Query(insertQuery,[ insertIdx.insertId, deliveryList[i] ]);
        }
    } catch (error) {
        return next(error);
    }
    
    return res.r();
});



module.exports = router;

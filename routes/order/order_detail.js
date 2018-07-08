const express = require('express');
const router = express.Router();

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt');

const moment = require('moment');

//Written By 이민형
//주문내역 상세보기 기능

router.post('/',async (req,res,next) => {
    let { order_idx } = req.body;
    let result = {}
    let flag = true;
    let imageList = new Array();

    // const chkToken = jwt.verify(req.headers.authorization);
    // if (chkToken == undefined) {
    //     return next("10403")
    // }

    let selectOrderQuery = 
    `
    SELECT payment_date, product
    FROM orders
    WHERE idx = ?
    `
    try{
        var selectOrderResult = await db.Query(selectOrderQuery,[order_idx])
    } catch(err){
        return next("500")
    }

    if(selectOrderResult.length == 0){
        return next("400")
    }
    let payment_date = selectOrderResult[0].payment_date
    let total = selectOrderResult[0].product

    let deliveryDate = getDeliveryDate(payment_date,total);
    let end_date = deliveryDate[deliveryDate.length-1]

    let selectQuery = 
    `
    SELECT img_url 
    FROM products 
    WHERE yearmonth = ?
    `

    if(moment(end_date).format('YYYY.MM.DD') > moment().format('YYYY.MM.DD')){
        let countQuery = 
        `
        SELECT *
        FROM reservations
        WHERE order_idx = ?
        `
        let countResult = await db.Query(countQuery,[order_idx])
        if(!countResult){
            return next("500")
        } else {
            for(let i=0;i<total-countResult.length;i++){
                let selectResult = await db.Query(selectQuery,[moment(payment_date).add(i,'M').format('YYYYMM')])
                if(!selectResult){
                    return next("500")
                    flag = false;
                    break;
                } else if(selectResult.length === 0){
                    return next("400")
                    flag = false;
                    break;
                } else {
                    let image = new Object();
                    image.img_url = selectResult[0].img_url;
                    imageList.push(image);
                }
            }
        }
    } else {
        for(let i=0;i<total;i++){
            let test = moment(payment_date).add(i,'M').format('YYYYMM')
            let selectResult = await db.Query(selectQuery,[test]);
            if(!selectResult){
                return next("500")
                flag = false;
                break;
            } else if(selectResult.length === 0){
                return next("400")
                flag = false;
                break;
            } else {
                let image = new Object();
                image.img_url = selectResult[0].img_url;
                imageList.push(image);
            }
        }
    }

    if(flag){
        result = {imageList}
        res.r(result);
    }
})

//다음주의 원하는 요일 구하는 함수(한주의 시작을 월요일로 가정)
function getNextDayofWeek(date,dayOfWeek){

	var resultDate = moment(date)
	var day = moment(resultDate).day() === 0 ? 7 : moment(resultDate).day();
	
	resultDate = moment(resultDate).add(dayOfWeek + 7 - day,'day')

	return moment(resultDate);
}

//달의 첫번째 월요일을 구하는 함수
function getFirstMonday(date){
	var date = moment(date).startOf('month')
	while(moment(date).day() !== 1){
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

 module.exports = router
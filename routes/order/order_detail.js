const express = require('express');
const router = express.Router();

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt');

const moment = require('moment');

//Written By 이민형
//주문내역 상세보기 기능
router.post('/',async (req,res,next) => {
console.log("in here");
    let { order_idx } = req.body;
    let result = new Array();
    let flag = true;

console.log("111");
    const chkToken = jwt.verify(req.headers.authorization);
    if (chkToken == undefined) {
        return next("10403")
    }
    if (!order_idx){
        return next("400")
    }

    let selectOrderQuery = 
    `
    SELECT payment_date,end_date,product
    FROM orders
    WHERE idx = ?
    `

    try{
console.log("222");
        var selectOrderResult = await db.Query(selectOrderQuery,[order_idx])
console.log("333");
    } catch(err){
        return next("500")
    }

    if(selectOrderResult.length == 0){
        return next("1408")
    }

    let total = selectOrderResult[0].product
    if(selectOrderResult[0].product != 3 && selectOrderResult[0].product != 6){total = 1}
    //수정 전 
    //let end_date = deliveryDate[deliveryDate.length-1]
    //수정 후

    let payment_date = selectOrderResult[0].payment_date
    let deliveryDate = getDeliveryDate(payment_date,total);
    let real_end_date = selectOrderResult[0].end_date // 테이블에 저장된 배송끝 날짜
    let calc_end_date = deliveryDate[deliveryDate.length-1] //결제일자로 계산한 배송 끝 날짜
    let selectQuery = 
    `
    SELECT img_url 
    FROM products 
    WHERE yearmonth = ?
    `
    

    //정기권 진행중이거나 일일권을 아직 받지 않았을때
    if(moment(real_end_date).format('YYYY.MM.DD') > moment().format('YYYY.MM.DD.')){
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
            //월 패키지 박스일 떄
            if(selectOrderResult[0].product != 2 && selectOrderResult[0].product != 7){
                for(let i=0;i<total-countResult.length;i++){
                    let selectResult = await db.Query(selectQuery,[moment(payment_date).add(i,'M').format('YYYYMM')])
                    if(!selectResult){
                        return next("500")
                    } else if(selectResult.length === 0){
                        return next("400")
                    } else {
                        result.push(selectResult[0].img_url)
                    }
                }
            } else {
                //생일 또는 처음 박스일 때
                for(let i=0;i<total-countResult.length;i++){
                    let selectResult = await db.Query(selectQuery,[selectOrderResult[0].product])
                    if(!selectResult){
                        return next("500")
                    } else if(selectResult.length === 0){
                        return next("400")
                    } else {
                        result.push(selectResult[0].img_url)
                    }
                }
            }
        }
    } else {//전부 받았을때 또는 정기권 취소일때
        
        //월 패키지 박스 받을때(정기권, 월 패키지 일일권)
        if(selectOrderResult[0].product != 2 && selectOrderResult[0].product != 7){
            if(real_end_date != calc_end_date){ //정기권 취소인경우
                console.log("정기권 취소")
                console.log(total)
                for(let i=0;i<total;i++){
                    if(moment(deliveryDate[i]).format('YYYY.MM.DD') > moment(real_end_date).format('YYYY.MM.DD')){ //취소 전까지 받은 수 만큼 넣어주기
                        console.log("탈출")
                        break;
                    } else {
                        let test = moment(payment_date).add(i,'M').format('YYYYMM')
                        let selectResult = await db.Query(selectQuery,[test]);
                        if(!selectResult){
                            return next("500")
                        } else if(selectResult.length === 0){
                            return next("400")
                        } else {
                            result.push(selectResult[0].img_url)
                        }
                    }
                }
            } else { 
                console.log("정기권 취소 X")
                for(let i=0;i<total;i++){
                    let test = moment(payment_date).add(i,'M').format('YYYYMM')
                    let selectResult = await db.Query(selectQuery,[test]);
                    if(!selectResult){
                        return next("500")
                    } else if(selectResult.length === 0){
                        return next("400")
                    } else {
                        result.push(selectResult[0].img_url)
                    } 
                }
            }
        } else { // 생일축하나 처음 박스
            console.log("생일 축하")
            let selectResult = await db.Query(selectQuery,[selectOrderResult[0].product])
            if(!selectResult){
                return next("500")
            } else if(selectResult.length === 0){
                return next("400")
            } else {
                result.push(selectResult[0].img_url)
            }
        }
    }
    res.r(result)
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

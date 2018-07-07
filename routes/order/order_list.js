const express = require('express');
const router = express.Router();

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt');

const moment = require('moment')



//달의 첫번째 월요일을 구하는 함수
function getFirstMonday(date){
	var date = moment(date).startOf('month')
	while(moment(date).day() !== 1){
		date = moment(date).add(1,'d')
	}	
	return date
}

// Written by 이민형
// 주문내역 리스트 기능
// Edit by 신기용 (7.5)
// --> Response Frame 통일 작업 + 로직 변경
// 데이터 제대로 넣고 다시 수정 필요 !!!
router.get('/:user_idx', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);
    if(chkToken == -1) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }
    let {user_idx} = req.params;

    if(user_idx === null){
        return next("1402"); // "description": "아이디가 존재하지 않습니다.",
    } else {
           
        let selectQuery = 
        `
        SELECT idx,product, payment_date as term
        FROM orders 
        WHERE user_idx = ? 
        ORDER BY payment_date DESC
        `

        let result = {};
        result.ticket = {};
        result.ticketed = [];

        try {
            selectResult = await db.Query(selectQuery,[user_idx])
            console.log('111');
            for(let i=0; i< selectResult.length; i++){
                let product_name = selectResult[i].product;
                selectResult[i].flag = 0;

                console.log('222');
                if(product_name == 3 || product_name == 6 ){    
                    let endDate = selectResult[i].term;
                    endDate = getFirstMonday(moment(endDate).add(selectResult[i].product-1,'M'))
                    selectResult[i].term = selectResult[i].term + ' - ' + moment(endDate).format('YYYY.MM.DD');
                    selectResult[i].product = product_name + "개월 정기권";
                    selectResult[i].flag = 1;


                    let _endDate = moment(endDate).format('YYYY.MM.DD');
                    let currentDate = moment().format('YYYY.MM.DD');
                    if(currentDate < _endDate){
                        result.ticket = selectResult[i];
                    }else{
                        result.ticketed.push(selectResult[i]);
                    }

                }
                else if( product_name == 1 ){
                    selectQuery = 
                    `
                    SELECT delivery_date
                    FROM reservations
                    WHERE order_idx = ?
                    `
                    console.log('333');
                    try {
                        let _selectResult = await db.Query(selectQuery,[selectResult[i].idx]);
                        console.log('idx : ' + selectResult[i].idx);
                        console.log('_selectResult : ' + _selectResult.length);
                        console.log('444');
                        let month = _selectResult[0].delivery_date.substring(5,7);
                        console.log('month : ' + month);
                        if( parseInt(month) <= 10){
                            month = month[1];
                        }
                        selectResult[i].product = month + "월 패키지 박스";
                        result.ticketed.push(selectResult[i]);
                    } catch (error) {
                        return next(error);
                    }
                }
                else if( product_name == 2 ){
                    selectResult[i].product = "고양이는 처음이지? 박스";
                    result.ticketed.push(selectResult[i]);
                }else if( product_name == 7 ){
                    selectResult[i].product = "생일축하해!";
                    result.ticketed.push(selectResult[i]);
                } // End of if 
            } // End of for
        } catch (error) {
            return next(error);
        }
        return res.r(result);
    } // End of else
});



//Written by 이민형
//주문내역 리스트 기능
router.get('/:user_idx',async (req,res) => {
   // let {token} = req.headers;
    let {user_idx} = req.params;
    let token = "asdfasdf"
    if(token === undefined || token === null){
        res.status(400).send({
            state : "Token value error!"
        })
    } else {
        if(user_idx === null){
            res.status(400).send({
                state : "user_idx error!"
            })
        } else {
           // let decoded = jwt.decoded(token);
           let decoded = "asdf"
            if(decoded === -1){
                res.status(500).send({
                    state : "Token Decoded error!"
                })
            } else {
                let selectQuery = 
                `
                SELECT idx,user_idx,product,payment_date 
                FROM orders 
                WHERE user_idx = ? 
                ORDER BY payment_date ASC
                `
                let selectResult = await db.Query(selectQuery,[user_idx])

                if(!selectResult){
                    res.status(500).send({
                        state : "Internal Server Error!"
                    })
                } else {
                    for(let i = 0;i<selectResult.length;i++){
                        if(selectResult[i].product > 2 ){
                            let endDate = selectResult[i].payment_date;
                            endDate = getFirstMonday(moment(endDate).add(selectResult[i].product-1,'M'))
                            selectResult[i].endDate = moment(endDate).format('YYYY.MM.DD');
                        } else {
                            selectResult[i].endDate = null;
                        }
                    }
                    res.status(200).send({
                        message : "Succesfully Load Order List",
                        result : selectResult
                    })
                }
            }
        }
    }
})

module.exports = router;

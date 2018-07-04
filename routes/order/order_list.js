const express = require('express');
const router = express.Router();

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt');

const moment = require('moment')


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

//달의 첫번째 월요일을 구하는 함수
function getFirstMonday(date){
	var date = moment(date).startOf('month')
	while(moment(date).day() !== 1){
		date = moment(date).add(1,'d')
	}
	
	return date
}
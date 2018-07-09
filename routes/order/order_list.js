const express = require('express');
const router = express.Router();

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt');

const moment = require('moment')



//달의 첫번째 월요일을 구하는 함수
function getFirstMonday(date) {
    var date = moment(date).startOf('month')
    while (moment(date).day() !== 1) {
        date = moment(date).add(1, 'd')
    }
    return date
}

// Written by 이민형
// 주문내역 리스트 기능
// Edit by 신기용 (7.5)
// --> Response Frame 통일 작업 + 로직 변경
// 데이터 제대로 넣고 다시 수정 필요 !!!
router.get('/', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);
    if (chkToken == undefined) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }

    if (chkToken.user_idx === null) {
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
            selectResult = await db.Query(selectQuery, [chkToken.user_idx])

            for (let i = 0; i < selectResult.length; i++) {
                selectResult[i].idx = selectResult[i].idx + "";
                let product_name = selectResult[i].product;
                selectResult[i].flag = "0";

                if (product_name == 3 || product_name == 6) {
                    let endDate = selectResult[i].term;
                    endDate = getFirstMonday(moment(endDate).add(selectResult[i].product - 1, 'M'))
                    selectResult[i].term = selectResult[i].term + ' - ' + moment(endDate).format('YYYY.MM.DD');
                    selectResult[i].product = product_name + "개월 정기권";
                    selectResult[i].flag = "1";


                    let _endDate = moment(endDate).format('YYYY.MM.DD');
                    let currentDate = moment().format('YYYY.MM.DD');
                    if (currentDate < _endDate) {
                        result.ticket = selectResult[i];
                    } else {
                        result.ticketed.push(selectResult[i]);
                    }

                }
                else if (product_name == 1) {
                    selectQuery =
                        `
                    SELECT delivery_date
                    FROM reservations
                    WHERE order_idx = ?
                    `
                    try {
                        let _selectResult = await db.Query(selectQuery, [selectResult[i].idx]);

                        if (_selectResult.length > 0) {
                            let month = _selectResult[0].delivery_date.substring(5, 7);
                            console.log('month : ' + month);
                            if (parseInt(month) <= 10) {
                                month = month[1];
                            }
                            selectResult[i].product = month + "월 패키지 박스";
                            result.ticketed.push(selectResult[i]);
                        }
                    } catch (error) {
                        return next(error);
                    }
                }

                else if( product_name == 2 ){
                    selectResult[i].product = "고양이는 처음이지?";

                    result.ticketed.push(selectResult[i]);
                } else if (product_name == 7) {
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

// Written by 정경인
// 주문 삭제 
router.delete('/', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);
    let { order_idx } = req.query

    if (chkToken == undefined) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }    
    let Query = `
    DELETE FROM reservations
    WHERE order_idx = ?
    `
    try {
        await db.Query(Query, [order_idx])
    } catch (error) {
        return next(error)
    }
    return res.r()

})



module.exports = router;

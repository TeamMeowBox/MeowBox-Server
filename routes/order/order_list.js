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
// Next Edit 이민형 (7.11)
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
        SELECT idx,product, payment_date as term, end_date as end_term
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
                    //수정 전
                    //selectResult[i].term = selectResult[i].term + ' - ' + moment(endDate).format('YYYY.MM.DD');

                    //수정 후
                    selectResult[i].term = selectResult[i].term + ' - ' + selectResult[i].end_term 
                    selectResult[i].product = product_name + "개월 정기권";
                    selectResult[i].flag = "1";

                    //수정 전
                    //let _endDate = moment(endDate).format('YYYY.MM.DD');

                    //수정 후
                    let _endDate = moment(selectResult[i].end_term)
                    let currentDate = moment().format('YYYY.MM.DD');
                    //수정 전
                    // if (currentDate < _endDate) {
                    //     result.ticket = selectResult[i];
                    // } else {
                    //     result.ticketed.push(selectResult[i]);
                    // }

                    //Edit By 이민형
                    //수정 후
                    if(moment(endDate).format('YYYY.MM.DD') != moment(_endDate).format('YYYY.MM.DD')){ //정기권 취소
                        selectResult[i].term = moment(_endDate).format('YYYY.MM.DD') + " 정기권 취소"
                        result.ticketed.push(selectResult[i])
                    } else if (currentDate < moment(_endDate).format('YYYY.MM.DD')) { //정기권이 아직 안끝났을때
                        result.ticket = selectResult[i]
                    } else { //끝났을때
                        result.ticketed.push(selectResult[i])
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

                else if (product_name == 2) {
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
// Edit by 권서연
// 정기권 삭제 
router.delete('/:order_idx', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);
    let { order_idx } = req.params;

    if (chkToken == undefined) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }
    let reserveDeleteQuery =
    `
    DELETE FROM reservations
    WHERE order_idx = ?
    `;
    let endDateUpdateQuery =
    `
    UPDATE orders
    SET end_date = ?
    WHERE idx = ?
    `;
    let currentDate = moment().format('YYYY.MM.DD');
    let result ={};
    db.Transaction(async (connection) => {
        await connection.query(reserveDeleteQuery, [Number(order_idx)]);
        await connection.query(endDateUpdateQuery, [currentDate.toString(), Number(order_idx)]);
    }).catch(error => {
        return next(error);
    });
    result.flag = "-1";
    return res.r(result)
});

module.exports = router;

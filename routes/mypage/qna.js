
const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const async = require('async');
const bodyParser = require('body-parser');
const moment = require('moment');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


/*
 Method : get
 */
// Written By 서연
// qna 화면 보기
router.get('/', async (req, res,next) => {
    const chkToken = jwt.verify(req.headers.authorization);

    if (chkToken == undefined) {
        return next("10403")
    }
    let qnaSelectQuery =
        `
        SELECT category, question, answer
        FROM qna    
        `;

    let result ={}; 
    try {
        let qnaResult = await db.Query(qnaSelectQuery);

        let product = new Array();
        let delivery = new Array();
        let packing = new Array();
        let subscribe = new Array();
        for (let i = 0; i < qnaResult.length; i++) {
            switch (qnaResult[i].category) {
                case '0':
                    product.push(qnaResult[i]);
                    break;
                case '1':
                    delivery.push(qnaResult[i]);
                    break;
                case '2':
                    packing.push(qnaResult[i]);
                    break;
                case '3':
                    subscribe.push(qnaResult[i]);
                    break;
            }
        }   //for 문 

        result = {product,delivery,packing,subscribe};

    } catch (error) {
        return next(error)
    }
    return res.r(result);
});

module.exports = router;    
/*
 Declare module
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const async = require('async');
const bodyParser = require('body-parser');
const moment = require('moment');
const db = require('../../module/pool.js');


/*
 Method : get
 */
 // Written By 서연
 // qna 화면 보기
router.get('/qna', async(req, res) =>{
    console.log("success connection");
    let qnaSelectQuery =
    `
    SELECT question, answer, category
    FROM qna    
    `;

    let qnaResult = await db.Query(qnaSelectQuery);
    
    if (qnaResult.length === 0){
        res.status(404).send({
            message: "server error"
        });
    } else {
        let product = new Array();
        let delivery = new Array();
        let packing = new Array();
        let subscribe = new Array();

        console.log('qnaResult.length' +qnaResult.length );
        for(let i=0;i<qnaResult.length;i++){
            switch(qnaResult[i].category){
                case '0' :
                    product.push(qnaResult[i]);
                    break;            
                case '1' :
                    delivery.push(qnaResult[i]);
                    break;
                case '2' :
                    packing.push(qnaResult[i]);
                    break;
                case '3' :
                    subscribe.push(qnaResult[i]);
                    break;   
            }
        }
        try{
            await res.status(200).send({
                     state :  'Select Qna Success',
                     product : product,
                     delivery : delivery,
                     packing : packing,
                     subscribe : subscribe
                });
            } catch (error) {
                res.status(500).send({
                    state : 'Select Qna Error'
                });
            }
        }
});

module.exports = router;    
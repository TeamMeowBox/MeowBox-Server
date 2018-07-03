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
    SELECT idx, answer, category, question 
    FROM qna
    `;
    try{
        await db.Query(qnaSelectQuery);
        await res.status(200).send({
            state :  'Select Qna Success'
        });
    } catch (error) {
        res.status(500).send({
            state : 'Select Qna Error'
        });
    }
    
});
  
module.exports = router;
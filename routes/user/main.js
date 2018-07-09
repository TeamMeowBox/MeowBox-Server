/*
 Declare module
 */
const express = require('express');
const router = express.Router();
const _crypto = require('crypto');
const async = require('async');
const bodyParser = require('body-parser');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
const secretKey = require('../../config/secretKey').key;



function encrypt(u_password) {
    const encrypted = _crypto.createHmac('sha512', secretKey).update(u_password).digest('base64');
    return encrypted;
}


/*
 Method : Get
 */



/*
 Method : Post
 */

// Written By 신기용
// 로그인
router.post('/signin', async (req, res, next) => {
    let { email, pwd } = req.body;
    pwd = encrypt(pwd);

    let selectQuery =
    `
    SELECT idx, email, name, phone_number, image_profile
    FROM users
    WHERE email = ? and pwd = ?
    `;

    let selectCatQuery=
    `
    SELECT idx
    FROM cats
    WHERE user_idx = ?
    `

    let userTicketQuery=
    `
    SELECT o.product 
    FROM orders as o, reservations as r
    WHERE o.idx = r.order_idx and o.user_idx = ?
    `

    let result = {};
    try {
        let _result = await db.Query(selectQuery, [email, pwd.toString('base64')]);
        if(!_result[0]){
                return next("401");
        }
        let catQueryResult = await db.Query(selectCatQuery, [_result[0].idx]);
        if(_result.length > 0){
            let userTicket = await db.Query(userTicketQuery, [_result[0].idx]);
            
            result.flag = userTicket.length > 0 ? "1" : "-1" ;
            result.token = jwt.sign(email, _result[0].idx);
            result.email = _result[0].email;
            result.name = _result[0].name;
            result.phone_number = _result[0].phone_number;
            result.image_profile = _result[0].image_profile;
            result.cat_idx = catQueryResult.length > 0 ? String(catQueryResult[0].idx) : "-1";
        }
        else{
            return next("401");
        }
    } catch (error) {
        return next(error);
    }

    return res.r(result);

});


// Written By 신기용
// 회원가입 
router.post('/signup', async (req, res, next) => {
    let { email, pwd, name, phone_number } = req.body;
    pwd = encrypt(pwd);

    let selectEmail =
        `
    SELECT *
    FROM users
    WHERE email = ?
    `;

    let result = {};

    try {
        let selectResult = await db.Query(selectEmail, [email]);
        if (selectResult.length > 0) {
            return next("1401"); // "description": "아이디가 중복됩니다.",
        }

        let insertQuery =
                `
            INSERT INTO users (email,pwd,name,phone_number,image_profile)
            VALUES(?,?,?,?,?);
            `;
            
        let userResult = await db.Query(insertQuery, [email, pwd, name, phone_number, 'https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/meow_box_logo.jpeg']);
        result.token = jwt.sign(email, userResult.insertId);

        result.flag = "-1" ;
        result.email = email;
        result.name = name;
        result.phone_number = phone_number;
        result.image_profile = 'https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/meow_box_logo.jpeg';
        result.cat_idx = "-1";





    } catch (error) {
        return next(error);
    }
    return res.r(result);
});

// Written By 정경인
// 묘 정보
router.get('/cat/:cat_idx', async (req, res, next) => {

    const chkToken = jwt.verify(req.headers.authorization);

    if (chkToken  == undefined) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }

    let { cat_idx } = req.params;

    let selectQuery =
        `
    SELECT idx as cat_idx, name, size, birthday, caution
    FROM cats
    WHERE idx = ?
    `;

    let result ={};
    try {
        let selectResult = await db.Query(selectQuery, [cat_idx]);
        if (selectResult.length === 0) {
            result.cat_idx = -1;
        }else{
            result.cat_idx = selectResult[0].cat_idx + ""
            result.name = selectResult[0].name
            result.size = selectResult[0].size + ""
            result.birthday = selectResult[0].birthday
            result.caution= selectResult[0].caution
        }
              
    } catch (error) {
        return next(error);
    }
    return res.r(result);
});


// Written By 신기용
// 묘등록
router.post('/cat_signup', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);

    if (chkToken == undefined) {
        next("10403"); // "description": "잘못된 인증 방식입니다."
    }

    const { name, size, birthday, caution } = req.body;

    let result = {};
    try {
        let insertQuery =
        `
        INSERT INTO cats (user_idx, name, size, birthday, caution)
        VALUES(?,?,?,?,?);
        `;

        let _result = await db.Query(insertQuery,[chkToken.user_idx,name,size,birthday,caution]);
        result.cat_idx = _result.insertId + "";

    } catch (error) {
        return next(1407)
    }
    return res.r(result);
});


// Written By 정경인
// 회원 탈퇴
router.delete('/account', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);

    if (chkToken == undefined) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }

    let selectIdxQuery =
        `
    SELECT idx
    FROM users
    WHERE email = ?
    `;
    let deleteQuery =
        `
    DELETE
    FROM users
    WHERE idx = ?
    `;

    let result;
    try {
        let user_idx = await db.Query(selectIdxQuery, [chkToken.email]);
        if (user_idx.length === 0) {
           return next("1402"); // "description": "아이디가 존재하지 않습니다.",
        }
        else{
        await db.Query(deleteQuery, [user_idx[0].idx]);
        }
    } catch (error) {
        next(error);
    }
    return res.r();
});


module.exports = router;

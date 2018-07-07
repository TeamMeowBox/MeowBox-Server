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
    SELECT email, idx,  name, phone_number,image_profile
    FROM users
    WHERE email = ? and pwd = ?
    `;

    let selectCatQuery=
    `
    SELECT idx
    FROM cats
    WHERE user_idx = ?
    `
    
    let result = {};
    try {
        let _result = await db.Query(selectQuery, [email, pwd.toString('base64')]);
        if(!_result[0]){
                return next("401");
        }
        let catQueryResult = await db.Query(selectCatQuery, [_result[0].idx]);
        if(_result.length > 0){
            result.token = jwt.sign(email);
            result.user_idx = _result[0].idx;
            result.phone_number = _result[0].phone_number;
            result.image_profile = _result[0].image_profile;
            result.cat_idx = catQueryResult.length > 0 ? catQueryResult[0].idx : -1;
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
        else {
            let insertQuery =
                `
            INSERT INTO users (email,pwd,name,phone_number)
            VALUES(?,?,?,?);
            `;
            try {
                let userResult = await db.Query(insertQuery, [email, pwd, name, phone_number]);
                result.token = jwt.sign(email);
                result.user_idx = userResult.insertId;
                result.cat_idx = -1;
            } catch (error) {
                return next(error);
            }
        }
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
            result.cat_idx = selectResult[0].cat_idx
            result.name = selectResult[0].name
            result.size = selectResult[0].size
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
         next("10403"); // "description": "잘못된 인증 방식입니다.",
    }

    let { name, size, birthday, caution } = req.body;   

    let selectIdxQuery =
        `
    SELECT idx
    FROM users
    WHERE email = ?
    `;

    let result;
    try {
        let user_idx = await db.Query(selectIdxQuery, [chkToken.email]);
        if (user_idx.length == 0) {
            next("1402"); // "description": "아이디가 존재하지 않습니다.",
        }
        else {
            let catQuery =
                `
            SELECT * FROM cats
            WHERE user_idx  = ?    
                `;
            let catResult = await db.Query(catQuery, [user_idx[0].idx]);
            if(catResult.length !== 0){
                return next("400")  //잘못된 요청입니다.
            }
            else{
            let insertQuery =
                `
            INSERT INTO cats (user_idx, name, size, birthday, caution)
            VALUES(?,?,?,?,?);
            `;
            try {
                await db.Query(insertQuery, [user_idx[0].idx, name, size, birthday, caution]);
            } catch (error) {
                next(error);
            }
        }
        } // End of else  
            
    } catch (error) {
        return next(error);
    }
    return res.r();
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

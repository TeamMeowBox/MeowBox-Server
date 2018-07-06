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
    SELECT email, idx
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
        let catQueryResult = await db.Query(selectCatQuery, [_result[0].idx]);
        if(_result.length > 0){
            result.token = jwt.sign(email);
            result.user_idx = _result[0].idx;
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
                let _result = await db.Query(insertQuery, [email, pwd, name, phone_number]);
                result.token = jwt.sign(email);
                result.user_idx = _result.insertId;
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

// Written By 신기용
// 묘등록
router.post('/cat_signup', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);
    
    if(chkToken == -1) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
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
        } // End of else    
    } catch (error) {
        return next(error);
    }
    return res.r();  
});



// Written By 정경인
// 회원 탈퇴
router.delete('/account/:user_idx', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);
    
    if(chkToken == -1) {
        return next("10403"); // "description": "잘못된 인증 방식입니다.",
    }
    
    let { user_idx } = req.params;

    let deleteQuery =
    `
    DELETE
    FROM users
    WHERE idx = ?
    `;

    let result;
    try {
        await db.Query(deleteQuery, [user_idx]);
    } catch (error) {
        next(error);
    }
    return res.r();
});


module.exports = router;

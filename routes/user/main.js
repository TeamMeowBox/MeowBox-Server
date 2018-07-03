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
router.post('/signin', async(req, res, next) => {
    let {email,pwd} = req.body;
    pwd = encrypt(pwd);

    let selectQuery = 
    `
    SELECT email
    FROM users
    WHERE email = ? and pwd = ?
    `;

    let result = await db.Query(selectQuery, [email, pwd.toString('base64')]); 
    if( result.length == 0){
        res.status(404).send({
            message: "Login Fail "
        });
    }
    else{
        let token = jwt.sign(email);
        res.status(200).send({
            "result" : {
                message : "Login Success",
                token : token 
            }
        })
    } // End of else    
});


// Written By 신기용
// 회원가입 
router.post('/signup', async(req, res) => {
    let {email, pwd, name, phone_number } = req.body;
    pwd = encrypt(pwd);


    let selectEmail = 
    `
    SELECT *
    FROM users
    WHERE email = ?
    `;

    let selectResult = await db.Query(selectEmail,[email]);
    if(selectResult.length > 0 ){
        res.status(200).send({
            state : "ID already exist !",
        });
    }
    else{
        let insertQuery = 
        `
        INSERT INTO users (email,pwd,name,phone_number)
        VALUES(?,?,?,?);
        `;

        
        try {
            await db.Query(insertQuery,[email,pwd,name,phone_number]);
            await res.status(200).send({
                message : "Register Success"
            });
        } catch (error) {
            res.status(500).send({
                message : "Register Error"
            });
        }
    }
});

 // Written By 신기용
 // 묘등록

 router.post('/cat_signup', async(req, res, next) => {
    // const chkToken = jwt.verify(req.headers.authorization);
    /*
    if(chkToken == -1) {
        res.status(401).send({
            message : "Access Denied"
        });
    }
    */

    let chkToken = {};
   chkToken.email = "1";

    let {name, size, birthday, caution} = req.body;

    let selectIdxQuery = 
    `
    SELECT idx
    FROM users
    WHERE email = ?
    `;

    let user_idx = await db.Query(selectIdxQuery, [chkToken.email]); 
    console.log('idx length : ' + user_idx.length);

    if( user_idx.length == 0){
        res.status(404).send({
            message: "Cat Register Fail "
        });
    }
    else{
        let insertQuery = 
        `
        INSERT INTO cats (user_idx, name, size, birthday, caution)
        VALUES(?,?,?,?,?);
        `;

        try {
            await db.Query(insertQuery,[user_idx[0].idx,name,size,birthday,caution]);
            await res.status(200).send({
                message : "Register Cat Success"
            });
        } catch (error) {
            res.status(500).send({
                message : "Register Error"
            });
        }
        



    } // End of else    
});



 module.exports = router;


const express = require('express');
const router = express.Router();
const async = require('async');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');

// 
// Written By 정경인
// 미유박스에 제안 
//
router.post('/', async (req, res, next) => {
    let { title, content } = req.body;
    const chkToken = jwt.verify(req.headers.authorization);

    if (chkToken == undefined) {
        return next("10403")
    }

    let result;
    let userSelectQuery = `SELECT idx FROM users WHERE idx = ?`
    try {
    result = await db.Query(userSelectQuery, [chkToken.user_idx]);
    if (result.length === 0) {
        return next("1406")
    }
    let Query = ` 
               INSERT INTO feedbacks(user_idx, title, content)
               VALUES(?,?,?)
             `
    
        await db.Query(Query, [chkToken.user_idx, title, content]);
    } catch (error) {
        return next(error);
    }
    return res.r();
});

module.exports = router;


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
    let { user_idx, title, content } = req.body;
    const chkToken = jwt.verify(req.headers.authorization);

    if (chkToken == -1) {
        return next("10403")
    }


    let _result, result;
    let userSelectQuery = `SELECT idx FROM users WHERE idx = ?`
    _result = await db.Query(userSelectQuery, [user_idx]);
    if (_result.length === 0) {
        return next("1406")
    }
    let Query = ` 
               INSERT INTO feedbacks(user_idx, title, content)
               VALUES(?,?,?)
             `
    try {
        result = await db.Query(Query, [user_idx, title, content]);
    } catch (error) {
        return next(error);
    }
    return res.r();

});

module.exports = router;

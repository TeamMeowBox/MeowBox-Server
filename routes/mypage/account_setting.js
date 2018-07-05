/*
 Declare module
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const async = require('async');
const bodyParser = require('body-parser');
const moment = require('moment');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
const upload = require('../../module/multer.js');


/*
 Method : get
 */
// Written By 서연
// 계정 설정 화면 보기
router.get('/account_setting/:user_idx', async (req, res) => {
    let { user_idx } = req.params;

    const chkToken = jwt.verify(req.headers.authorization);
    if (chkToken == -1) {
        return next("10403")
    }

    let _result, result;
    let userSelectQuery = `SELECT idx FROM users WHERE idx = ?`
    _result = await db.Query(userSelectQuery, [user_idx]);
    if (_result.length === 0) {
        return next("1406")
    } else {
        let accountSelectQuery =
            `
        SELECT users.name AS user_name, users.email, users.phone_number, users.image_profile, image_background,
               cats.name AS cat_name, cats.size, cats.birthday, cats.caution 
        FROM users JOIN cats ON users.idx = cats.user_idx
        WHERE users.idx = cats.user_idx
        AND users.idx = ?
        `;
        try {
            result = await db.Query(accountSelectQuery, [user_idx]);
        } catch (error) {
            return next(error);
        }
        return res.redirect(result);
    }
});
/*
 Method : post
 */
// Written By 서연
// 계정 수정
router.post('/account_setting/:user_idx', upload.fields([{ name: 'image_profile', maxCount: 1 }, { name: 'image_back', maxCount: 1 }]), async (req, res) => {
    let { user_idx, user_name, user_email, user_phone, image_profile, image_back, cat_name, cat_size, cat_birthday, cat_caution } = req.body;

    console.log(req.files);

    console.log('success connection');
    if (!user_idx || !user_name || !user_email || !user_phone || !cat_name || !cat_size || !cat_birthday || !cat_caution) {
        res.status(404).send({
            state: 'req.body error'
        })
    } else {
        let usersUpdateQuery =
            `
        UPDATE users 
        SET name = ?, phone_number = ?, email = ?
        WHERE idx = ?
        `; //users_update

        let catsUpdateQuery =
            `
        UPDATE cats
        SET  name = ?, size = ?, birthday = ?, caution = ?
        WHERE user_idx = ?
        `;//cats_update`

        try {
            await db.Query(usersUpdateQuery, [user_name, user_phone, user_email, user_idx]);
            await db.Query(catsUpdateQuery, [cat_name, cat_size, cat_birthday, cat_caution, user_idx]);
            await res.status(200).send({
                state: 'Update account Success'
            });
        } catch (error) {
            res.status(500).send({
                state: 'Update account Error'
            });
        }
    } // End of else    
});

module.exports = router;
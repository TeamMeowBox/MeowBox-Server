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
router.get('/account/:user_idx', async (req, res, next) => {
    let { user_idx } = req.params;

    const chkToken = jwt.verify(req.headers.authorization);
    if (chkToken == undefined) {
        return next("10403")
    }

    let _result,result;
    let userSelectQuery = `SELECT idx FROM users WHERE idx = ?`
    _result = await db.Query(userSelectQuery, [user_idx]);
    if (_result.length === 0) {
        return next("1406")
    }

    let accountSelectQuery =
        `
        SELECT users.name AS user_name, users.email, users.phone_number, users.image_profile, image_background,
               cats.name AS cat_name, cats.size, cats.birthday, cats.caution 
        FROM users  LEFT JOIN cats ON users.idx = cats.user_idx
        WHERE users.idx = ?
        `;
    try {
        let accountSelectResult= await db.Query(accountSelectQuery, [user_idx]);
        result = accountSelectResult[0];
    } catch (error) {
        return next(error);
    }
    return res.r(result);

});
/*
 Method : post
 */
// Written By 서연
// 계정 수정
router.post('/account', upload.fields([{ name: 'image_profile', maxCount: 1 }, { name: 'image_background', maxCount: 1 }]), async (req, res, next) => {
    let { user_idx, user_name, user_email, user_phone, cat_name, cat_size, cat_birthday, cat_caution } = req.body;

    let image_profile = req.files['image_profile'][0].location;
    let image_background = req.files['image_background'][0].location;

    // let image_background,image_profile;
    console.log(req.files)
    console.log(req.files['image_profile'][0].location)
    // console.log(req.files[0].image_background.location)

    console.log('success connection');
    if (!user_idx || !user_name || !user_email || !user_phone || !cat_name || !cat_size || !cat_birthday || !cat_caution) {
        return res.r("2402")
    } else {
        let usersUpdateQuery =
            `
        UPDATE users 
        SET name = ?, phone_number = ?, email = ? , image_profile = ?, image_background = ?
        WHERE idx = ?
        `; //users_update

        let catsUpdateQuery =
            `
        UPDATE cats
        SET  name = ?, size = ?, birthday = ?, caution = ?
        WHERE user_idx = ?
        `;//cats_update`

        try {
            await db.Query(usersUpdateQuery, [user_name, user_phone, user_email, image_profile, image_background, user_idx]);
            await db.Query(catsUpdateQuery, [cat_name, cat_size, cat_birthday, cat_caution, user_idx]);

        } catch (error) {
            return next(error)
        }
    } // End of else 
    return res.r();
});

module.exports = router;

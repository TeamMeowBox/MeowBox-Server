/*
 Declare module
 */
const express = require('express');
const router = express.Router();
const _crypto = require('crypto');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
const upload = require('../../module/multer.js');
const secretKey = require('../../config/secretKey').key;


function encrypt(u_password) {
    const encrypted = _crypto.createHmac('sha512', secretKey).update(u_password).digest('base64');
    return encrypted;
}


/*
 Method : get
 */
// Written By 서연
// 계정 설정 화면 보기
router.get('/account', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);
    if (chkToken == undefined) {
        return next("10403")
    }
    let user_idx = chkToken.user_idx;
    let _result,result;
    let userSelectQuery = `SELECT idx FROM users WHERE idx = ?`
    _result = await db.Query(userSelectQuery,[user_idx]);
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
        let accountSelectResult= await db.Query(accountSelectQuery,[user_idx]);
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
// Edit By 기용

// router.post('/account', upload.fields([{ name: 'image_profile', maxCount: 1 }, { name: 'image_background', maxCount: 1 }]), async (req, res, next) => {
router.post('/account', upload.fields([{ name: 'image_profile', maxCount: 1 }]), async (req, res, next) => {
    let {user_name, user_email, user_phone, cat_name, cat_size, cat_birthday, cat_caution } = req.body;

    let param = [];
    param.push(user_name);
    param.push(user_phone);
    param.push(user_email);

    let flag = 2;
    /*
    1 : image_profile만 있는 경우
    2 : image_background만 있는 경우
    3 : 2개다 있는 경우
    */
   let usersUpdateQuery;
   if(req.files['image_profile'] == undefined){
    usersUpdateQuery =
    `
    UPDATE users 
    SET name = ?, phone_number = ?, email = ?
    WHERE idx = ?
    `; //users_update
   }
   else{
    usersUpdateQuery =
    `
    UPDATE users 
    SET name = ?, phone_number = ?, email = ?, image_profile = ?
    WHERE idx = ?
    `; //users_update
    param.push(req.files['image_profile'][0].location)
   }
   
   const chkToken = jwt.verify(req.headers.authorization);
    if (chkToken == undefined) {
        return next("10403")
    }
    let user_idx = chkToken.user_idx;
    param.push(user_idx);
   
    console.log('success connection');
    if (!user_idx || !user_name || !user_email || !user_phone || !cat_name || !cat_size || !cat_birthday || !cat_caution) {
        return res.r("2402")
    } else {
        

        let catsUpdateQuery =
        `
        UPDATE cats
        SET  name = ?, size = ?, birthday = ?, caution = ?
        WHERE user_idx = ?
        `;//cats_update`

        try {
            await db.Query(usersUpdateQuery, param);
            await db.Query(catsUpdateQuery, [cat_name, cat_size, cat_birthday, cat_caution, user_idx]);

        } catch (error) {
            return next(error)
        }
    } // End of else 
    return res.r();
});



// Written By 기용
// My page에서 유저 정보 수정
router.post('/update_user', upload.fields([{ name: 'image_profile', maxCount: 1 }]), async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);
    if (chkToken == undefined) {
        return next("10403")
    }

    let { name, phone_number, pwd} = req.body;
    let image_profile = req.files['image_profile'][0].location;
    pwd = encrypt(pwd);
    console.log('image_profile : ' + image_profile);

    if (!name || !phone_number || !pwd ) {
        return res.r("2402")
    } 

    let usersUpdateQuery =
    `
    UPDATE users 
    SET name = ?, phone_number = ?, pwd = ? , image_profile = ?
    WHERE idx = ?
    `; 

    try {
        await db.Query(usersUpdateQuery, [name, phone_number, pwd, image_profile, chkToken.user_idx]);

    } catch (error) {
        return next(error)
    }

    return res.r();
});




// Written By 기용
// My page에서 고양이 정보 수정 
router.post('/update_cat', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);

    if (chkToken == undefined) {
        return next("10403")
    }

    let { name, size, birthday, caution} = req.body;
    let updateQuery = 
    `
    UPDATE cats 
    SET name = ?, size = ?, birthday = ? , caution = ?
    WHERE user_idx = ?
    `

    try {
        await db.Query(updateQuery, [name,size,birthday,caution, chkToken.user_idx]);
    } catch (error) {
        return next(error);
    }
    return res.r();
});



module.exports = router;

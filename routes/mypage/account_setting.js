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
    let _result, result;
    let userSelectQuery = `SELECT idx FROM users WHERE idx = ?`
    _result = await db.Query(userSelectQuery, [user_idx]);
    if (_result.length === 0) {
        return next("1406")
    }
    let accountSelectQuery =
        `
        SELECT users.name AS user_name, users.email, users.phone_number, users.image_profile,
               cats.name AS cat_name, cats.size, cats.birthday, cats.caution, cats.idx as cat_idx
        FROM users  LEFT JOIN cats ON users.idx = cats.user_idx
        WHERE users.idx = ?
        `;
    try {
        let accountSelectResult = await db.Query(accountSelectQuery, [user_idx]);
        result = accountSelectResult[0];
        result.cat_idx = accountSelectResult[0].cat_idx;
        result.cat_name = accountSelectResult[0].cat_name;
        result.size = accountSelectResult[0].size;
        result.birthday = accountSelectResult[0].birthday;
        result.caution = accountSelectResult[0].caution;
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
// Edit By 기용 , 경인
// App 용
router.post('/account', upload.fields([{ name: 'image_profile', maxCount: 1 }]), async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);
    if (chkToken == undefined) {
        return next("10403")
    }

    let user_idx = chkToken.user_idx;
    let { user_name, user_email, user_phone, cat_name, cat_size, cat_birthday, cat_caution } = req.body;

	console.log(" cat_name : " + cat_name);
	console.log(" cat_size : " + cat_size);
	console.log(" cat_birthday : " + cat_birthday);
    let catSelectQuery =
        `
    SELECT *
    FROM cats
    WHERE user_idx = ?
    `

    let catSelectResult = await db.Query(catSelectQuery, [chkToken.user_idx]);
    let catsUpdateQuery;
    let catSignUpFlag;
    if (catSelectResult.length > 0) { // 고양이 존재 o
	console.log(" You have Cat ") ;
        catSignUpFlag = 1;
        catsUpdateQuery =
            `
        UPDATE cats
        SET name = ? , size = ? , birthday = ?, caution = ? 
        WHERE user_idx = ?  
        `

        if (cat_name == undefined) {
            cat_name = catSelectResult[0].name;
        }
        if (cat_size == undefined) {
            cat_size = catSelectResult[0].size;
        }
        if (cat_birthday == undefined) {
            cat_birthday = catSelectResult[0].birthday;
        }
        if (cat_caution == undefined) {
            cat_caution = catSelectResult[0].caution;
        }

    }
    else { // 고양이 존재 x
	console.log(" You don't have cat " );
        catsUpdateQuery =
            `
        INSERT INTO cats(name, size, birthday, caution, user_idx)
        VALUES (?,?,?,?,?)
        `

	if ( cat_name == "-1" ) {
		console.log(" Don't wanna catSingUp " );
            catSignUpFlag = 0;
        }
        else if (cat_caution == undefined) {
		console.log(" You want catSingUp without caution" );
            catSignUpFlag = 1;
            cat_caution = "";
        }
        else {
		console.log(" You want catSingUp ");
            catSignUpFlag = 1;
        }
    }

    let userSelectQuery =
        `
    SELECT *
    FROM users
    WHERE idx = ?
    `
    let userSelectResult = await db.Query(userSelectQuery, [chkToken.user_idx]);
    if (userSelectResult.length == 0) {
        return next(400)
    }

    user_name, user_email, user_phone
    if (user_name == undefined) {
        user_name = userSelectResult[0].name;
    }

    if (user_email == undefined) {
        user_email = userSelectResult[0].email;
    }

    if (user_phone == undefined) {
        user_phone = userSelectResult[0].phone_number;
    }

    let param = [];
    param.push(user_name);
    param.push(user_phone);
    param.push(user_email);


    let usersUpdateQuery;
    if (req.files['image_profile'] == undefined) {
        console.log(" Image no ");
        usersUpdateQuery =
            `
    UPDATE users 
    SET name = ?, phone_number = ?, email = ?
    WHERE idx = ?
    `; //users_update
    }
    else {
        console.log(" Image yes ");
        usersUpdateQuery =
            `
    UPDATE users 
    SET name = ?, phone_number = ?, email = ?, image_profile = ?
    WHERE idx = ?
    `; //users_update
        param.push(req.files['image_profile'][0].location)
    }

    param.push(user_idx);
    console.log("param : " + param);
    let result = {};
    let catResult;
    //트랜잭션 처리
    db.Transaction(async (connection) => {
        await connection.query(usersUpdateQuery, param);
        if (catSignUpFlag) {
        console.log(" catSingUpFlag is True and Work it " );
        await connection.query(catsUpdateQuery, [cat_name, cat_size, cat_birthday, cat_caution, chkToken.user_idx])
		console.log(" catSignUpFlag work was Done ");
        }

        catSelectResult = await connection.query(catSelectQuery, [chkToken.user_idx]);
        console.log(" catSelectResult : " + catSelectResult.length );
        result.cat_idx = catSelectResult.length == 0 ? "-1" : catSelectResult[0].idx + "";
        result.token = jwt.sign(user_email, user_idx);
        return res.r(result);

    }).catch(error => {
        return next(error)
    })
});



// Written By 기용
// My page에서 유저 정보 수정
// Web용
router.post('/update_user', upload.fields([{ name: 'image_profile', maxCount: 1 }]), async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);
    if (chkToken == undefined) {
        return next("10403")
    }

    console.log('user_idx  : ' + chkToken.user_idx);

    let userSelectQuery =
        `
    SELECT name, pwd, phone_number, image_profile
    FROM users
    WHERE idx = ?
    `
    let userSelectResult;
    try {
        userSelectResult = await db.Query(userSelectQuery, [chkToken.user_idx]);
    } catch (error) {
        return next(error)
    }

    console.log(' userSelectResult : ' + userSelectResult[0].name);

    let image_profile;
    let { name, phone_number, pwd } = req.body;

    if (name == undefined) {
        name = userSelectResult[0].name;
    }
    if (phone_number == undefined) {
        phone_number = userSelectResult[0].phone_number;
    }
    if (pwd == undefined) {
        pwd = userSelectResult[0].pwd;
    } else {
        pwd = encrypt(pwd);
    }

    let param = [];
    param.push(name);
    param.push(phone_number);
    param.push(pwd);

    let usersUpdateQuery =
        `
    UPDATE users 
    SET name = ?, phone_number = ?, pwd = ?
    WHERE idx = ?
    `;

    if (req.files['image_profile'] != undefined) {
        image_profile = req.files['image_profile'][0].location;
        usersUpdateQuery =
            `
        UPDATE users 
        SET name = ?, phone_number = ?, pwd = ? , image_profile = ?
        WHERE idx = ?
        `;
        param.push(image_profile)
    }

    param.push(String(chkToken.user_idx))
    console.log(param);
    try {
        await db.Query(usersUpdateQuery, param);

    } catch (error) {
        return next(error)
    }
    return res.r();
});



// Written By 기용
// My page에서 고양이 정보 수정 
// Web용
router.post('/update_cat', async (req, res, next) => {
    const chkToken = jwt.verify(req.headers.authorization);

    if (chkToken == undefined) {
        return next("10403")
    }


    let selectCatQuery =
        `
    SELECT *
    FROM cats
    WHERE user_idx = ?
    `

    let { name, size, birthday, caution } = req.body;
    let updateQuery =
        `
    UPDATE cats 
    SET name = ?, size = ?, birthday = ? , caution = ?
    WHERE user_idx = ?
    `

    //트랜잭션 처리
    db.Transaction(async (connection) => {
        let result = await connection.query(selectCatQuery, [chkToken.user_idx]);
        console.log('result : ' + result);
        if (result.length == 0) {
            return next(400)
        }
        else {
            if (name == undefined) {
                name = result[0].name;
            }
            if (size == undefined) {
                size = result[0].size;
            }
            if (birthday == undefined) {
                birthday = result[0].birthday;
            }
            if (caution == undefined) {
                caution = result[0].caution;
            }
            await connection.query(updateQuery, [name, size, birthday, caution, chkToken.user_idx]);
        }
    }).catch(error => {
        return next(error)
    })
    return res.r();
});



module.exports = router;

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

//숫자 3단위에서 콤마 찍는 함수
function comma(num){
    var len, point, str; 
       
    num = num + ""; 
    point = num.length % 3 ;
    len = num.length; 
   
    str = num.substring(0, point); 
    while (point < len) { 
        if (str != "") str += ","; 
        str += num.substring(point, point + 3); 
        point += 3; 
    } 
    return str;
}


// method : Get
// Written By 서연
// Home에서 고양이 수
router.get('/catCount',  async (req, res,next) => {
    
    let catCountResult;
    let _result, result;
    let catCountQuery = 
    `
    SELECT count(*) as catCount
    FROM cats
    `;
    
    try {
        catCountResult = await db.Query(catCountQuery);
        result = catCountResult[0].catCount + 1000;
        _result = comma(result.toString());
    } catch (error) {
        return next(error);
    }
    return res.r(_result);
});


// method : Get
// Written By 서연
// Home에서 이번 달 미유박스 소개 크롤링
router.get('/crawling',  async (req, res,next) => {
    let randomSelectResult;
    let result;
   
    let randomSelectQuery = 
    `
    SELECT nickname, profile, picture 
    FROM crawling 
    ORDER BY RAND() LIMIT 4;
    `;

    try {
        randomSelectResult = await db.Query(randomSelectQuery);

        let instagram = new Array();
        for (let i = 0; i < randomSelectResult.length; i++){
            instagram.push(randomSelectResult[i])
        }
        result = instagram;

    } catch (error) {
        return next(error)
    }
    return res.r(result);
});
module.exports = router;

/* 
***
몽고
***
*/
// const express = require('express');
// const router = express.Router();

// const db = require('../../config/mongoPool.js')
// const mongoose = require('mongoose')
// const Schema = mongoose.Schema;

// var contentSchema = new Schema({
//     title : String,
//     main_img : String,
//     hashtag : [{type : String}],
//     main_text : String,
//     detail_img : [{type : String}],
//     detail_text : String
// })

// var package = new Schema({
//     package_img : String,
//     package_date : String,
//     content : [{
//         title : String,
//         main_img : String,
//         hashtag : [{type : String}],
//         main_text : String,
//         detail_img : [{type : String}],
//         detail_text : String
//     }]
// },{Collection : 'testhomes'})

// var testhomes = mongoose.model('testhomes',package,'testhomes')

// router.get('/',async (req,res,next) => {
//     // let {id} = req.params
//     let result;
//     try{
//         result = await testhomes.find({});
//     } catch(err){
//         return next(err);
//     }
//     console.log(result)
//     return res.r(result);
// })

// module.exports = router;
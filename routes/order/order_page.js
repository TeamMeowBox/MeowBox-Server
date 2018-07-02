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

/*
Method : Get
*/

function yyyymmdd(dateIn) {
    var yyyy = dateIn.getFullYear();
    var mm = dateIn.getMonth()+1; // getMonth() is zero-based
    if(mm < 10){ mm = '0'+mm; }
    var dd  = dateIn.getDate();
    if( dd < 10){ dd = '0'+dd; }
    return String(yyyy + '.' + mm + '.' + dd); // Leading zeros for mm and dd
 }
 


/*
Method : Post
*/

// Written By 신기용
// 주문 페이지
router.post('/', async(req, res, next) => {
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

   let {user_idx, product, name, address, phone_number, price} = req.body;

   let payment_date = new Date();
   payment_date = yyyymmdd(payment_date);
  
   console.log(product);

    let insertQuery = 
    `
    INSERT INTO orders (user_idx, name, address, phone_number, email, payment_date, price, product)
    VALUES(?,?,?,?,?,?,?,?);
    `;

    try {
        let result = await db.Query(insertQuery,[ user_idx, name, address, phone_number, chkToken.email, payment_date, price, product ]);
        console.log(result);
        await res.status(200).send({
            state : "Success Order Info"
        });
    } catch (error) {
        res.status(500).send({
            state : "Fail Order Info"
        });
    }
});



module.exports = router;

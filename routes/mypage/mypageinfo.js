
/*
 Default module
*/
const express = require('express');
const router = express.Router();
const async = require('async');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
// 
// Written By 정경인
// 마이페이지 첫 화면
//

router.get('/', async (req, res, next) => {
  let { user_idx } = req.query;
  let catinfo, sendImage, cnt;

  const chkToken = jwt.verify(req.headers.authorization);
  if (chkToken == undefined) {
      return next("10403")
  }
  let _result, result ={};
  let userSelectQuery = `SELECT idx FROM users WHERE idx = ?`
  _result = await db.Query(userSelectQuery, [user_idx]);
  if (_result.length ===0) {
      return next("1406")
  }
  let Query = ` 
                SELECT cats.name as cat_name 
                FROM users,cats 
                WHERE users.idx =? AND users.idx = cats.user_idx 
              `;

  let catResult = await db.Query(Query, [user_idx]);

  if (catResult.length === 0) {												// 고양이 유무
    result.catinfo = 0;
  } else {
    result.catinfo = catResult[0].cat_name;
  }
  Query = `
            SELECT  orders.product AS product, count(*) AS cnt
            FROM orders,reservations 
            WHERE orders.user_idx = ? AND orders.idx = reservations.order_idx
            order by orders.payment_date            
         `;

  try {

    let orderResult = await db.Query(Query, [user_idx]);

    if (!orderResult[0].product) {    //정기권 진행 중이 아닐때

      if (!orderResult[0].product || orderResult[0].product === 0) { // 주문기록이 없거나 1달정기권 이용했었던 유저
        sendImage =
        `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-18.png`; //나의 고양이에게 
      } else if (orderResult[0].product === 1) {
        sendImage = 
        `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-18.png`;//생일 축하해요.
      } else if (orderResult[0].product === 2) {
        sendImage = 
        `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-22.png`; //앞으로 잘부탁
      }
      result.flag = -1
      result.sendImage = sendImage;

      return res.r(result);

    } else { //정기권 진행중일때
      cnt = orderResult[0].product - orderResult[0].cnt;
      result.flag = 1;
      result.ticket = orderResult[0].product+"박스"
      result.use =  cnt+"박스"

      console.log(JSON.stringify(result))
      return res.r(result);
    }

  } catch (error) {
    return next(error)
  }

})

module.exports = router;

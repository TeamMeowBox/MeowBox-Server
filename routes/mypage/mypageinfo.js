
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
router.get('/', async (req, res, next) => {
  let sendImage, cnt;

  const chkToken = jwt.verify(req.headers.authorization);
  if (chkToken == undefined) {
    return next("10403")
  }
  console.log('user_idx : ' + chkToken.user_idx);
  let _result, result = {};
  let userSelectQuery = `SELECT idx FROM users WHERE idx = ?`
  _result = await db.Query(userSelectQuery, [chkToken.user_idx]);
  if (_result.length === 0) {
    return next("1406")
  }
  let Query = ` 
                SELECT cats.name as cat_name 
                FROM users,cats 
                WHERE users.idx =? AND users.idx = cats.user_idx 
              `;

  let catResult = await db.Query(Query, [chkToken.user_idx]);

  if (catResult.length === 0) {                                                // 고양이 유무
    result.catinfo = "-1";
  } else {
    result.catinfo = catResult[0].cat_name;
  }
  Query = `
          select orders.product ,reservations.*
          from orders right join reservations ON  orders.idx = reservations.order_idx
          WHERE orders.user_idx = ?
          order by reservations.order_idx desc;
          `;

  try {

    let orderResult = await db.Query(Query, [chkToken.user_idx]);
    // if (orderResult[0].product ===null || orderResult[0].product ===1 ||orderResult[0].product ===2 ||orderResult[0].product === 7 ) {    //정기권 진행 중이 아닐때
    if (orderResult.length ===0 || orderResult[0].product === 1) { // 주문기록이 없거나 1달정기권 이용했었던 유저
      sendImage =
        `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-18.png`; //나의 고양이에게 
      result.flag = "-1"
      result.sendImage = sendImage;

    } else if (orderResult[0].product === 7) {
      sendImage =
        `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-18.png`;//생일 축하해요.
      result.flag = "-1"
      result.sendImage = sendImage;

    } else if (orderResult[0].product === 2) {
      sendImage =
        `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-22.png`; //앞으로 잘부탁
      result.flag = "-1"
      result.sendImage = sendImage;

    } else { //정기권 진행중일때
      cnt = orderResult[0].product - orderResult.length
      result.flag = "1";
      result.ticket = orderResult[0].product + "박스"
      result.use = cnt + "박스"

    }
  } catch (error) {
    return next(error)
  }
  return res.r(result);
})

module.exports = router;

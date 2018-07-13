
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
  let result = {};
  const chkToken = jwt.verify(req.headers.authorization);
  if (chkToken == undefined) {
    return next('10403')
  }
  const SelectQuery =
    `
    SELECT u.image_profile, c.name
    FROM users AS u
    LEFT JOIN cats AS c ON u.idx = c.user_idx
    WHERE u.idx = ?
    `;

  let selectResult = await db.Query(selectQuery, [chkToken.user_idx]);

  result.catinfo = (selectResult.length === 0) ? "-1" : selectResult[0].cat_name;              // 고양이 유무


  let selectOrderQuery = `
          select orders.product ,reservations.*
          from orders right join reservations ON  orders.idx = reservations.order_idx
          WHERE orders.user_idx = ?
          order by reservations.order_idx desc;
          `;

  try {

    let selectOrderResult = await db.Query(selectOrderQuery, [chkToken.user_idx]);
    if (selectOrderResult.length === 0 || selectOrderResult[0].product === 1) { // 주문기록이 없거나 1달정기권 이용했었던 유저
      sendImage =
        `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-18.png`; //나의 고양이에게 
      result.flag = "-1"
      result.sendImage = sendImage;


    } else if (selectOrderResult[0].product === 7) {
      sendImage =
        `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-18.png`;//생일 축하해요.
      result.flag = "-1"
      result.sendImage = sendImage;

    } else if (selectOrderResult[0].product === 2) {
      sendImage =
        `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-22.png`; //앞으로 잘부탁
      result.flag = "-1"
      result.sendImage = sendImage;

    } else { //정기권 진행중일때

      cnt = selectOrderResult[0].product - selectOrderResult.length
      result.flag = "1";
      result.ticket = selectOrderResult[0].product + "박스"
      result.use = cnt + "박스"
      result.percent = Number(((cnt / selectOrderResult[0].product) * 100).toFixed()) //소수점 제거
    }


  } catch (error) {
    return next(error)
  }

  return res.r(result);
})

module.exports = router;

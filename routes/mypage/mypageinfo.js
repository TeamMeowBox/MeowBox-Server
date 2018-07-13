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
  let sendImage =[
    `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-18.png`, //나의 고양이에게 
    `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-27.png`,//생일 축하해요.
    `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-22.png` //앞으로 잘부탁
  ];
  let cnt, result = {};

  const chkToken = jwt.verify(req.headers.authorization);
  if (chkToken == undefined) {
    return next("10403")
  }
  let userSelectQuery =
    `
        SELECT * 
        FROM users 
        WHERE idx = ?
        `;

  let userSelectResult = await db.Query(userSelectQuery, [chkToken.user_idx]);

  let selectCatQuery = ` 
                SELECT cats.name as cat_name 
                FROM users,cats 
                WHERE users.idx =? AND users.idx = cats.user_idx 
              `;
  let selectCatResult = await db.Query(selectCatQuery, [chkToken.user_idx]);

  result.catinfo = (selectCatResult.length === 0) ? "-1" : selectCatResult[0].cat_name;                              // 고양이 유무


   let selectOrderQuery = `
              select orders.product, COUNT(*) as product_cnt , reservations.* 
              from orders right join reservations ON  orders.idx = reservations.order_idx
              WHERE orders.user_idx = ?
              GROUP BY(product)
              order by reservations.order_idx desc;
          `;

  try {
    let selectOrderResult = await db.Query(selectOrderQuery, [chkToken.user_idx]);
    let have_ticket_idx;
    let have_ticket_flag;

    result.flag = "-1"
    if(selectOrderResult.length === 0){ // 정기권 X and 주문 기록 x
      console.log('정기권 X       주문 기록 X');
      result.user_image_profile = userSelectResult[0].image_profile;
      result.sendImage = sendImage[0];  
    } else {  
      for(var i in selectOrderResult){
        if(selectOrderResult[i].product == 3 || selectOrderResult[i].product == 6 ){
          have_ticket_flag = true;
          have_ticket_idx= i;
          break;  
        } else {
          have_ticket_flag = false;   
        }
      } // end of For
      
      if( have_ticket_flag ){ // 정기권 존재     
        console.log('정기권 O');  
        let ticket = selectOrderResult[have_ticket_idx].product
        let use = selectOrderResult[have_ticket_idx].product - selectOrderResult[have_ticket_idx].product_cnt
        result.image_profile = userSelectResult[0].image_profile;
        result.flag = "1"
        result.ticket =ticket+"박스"
        result.use= use+"박스"
        result.percent =Number(((use/ticket)*100).toFixed() ) 
      }else { // 정기권 X 주문 기록 o
        console.log('정기권 X      주문 기록 O');
        result.user_image_profile = userSelectResult[0].image_profile;
        let picture_flag = selectOrderResult[0].product;
        if(picture_flag == 1 ){
          result.sendImage = sendImage[0]
        }else if(picture_flag == 2 ){
          result.sendImage = sendImage[2]
        }else{ // picture_flag == 7
          result.sendImage = sendImage[1]
        }
      }
    } // end of Else
  } catch (error) {
    return next(error)
  }
  return res.r(result);
})

module.exports = router;



    // if (selectOrderResult.length === 0 || selectOrderResult[0].product === 1) { // 주문기록이 없거나 1달정기권 이용했었던 유저
    //   sendImage =
    //     `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-18.png`; //나의 고양이에게 
    //   result.flag = "-1"
    //   result.sendImage = sendImage;

    // } else if (selectOrderResult[0].product === 7) {
    //   sendImage =
    //     `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-18.png`;//생일 축하해요.
    //   result.flag = "-1"
    //   result.sendImage = sendImage;

    // } else if (selectOrderResult[0].product === 2) {
    //   sendImage =
    //     `https://s3.ap-northeast-2.amazonaws.com/goodgid-s3/KakaoTalk_Photo_2018-07-05-12-47-22.png`; //앞으로 잘부탁
    //   result.flag = "-1"
    //   result.sendImage = sendImage;

    // } else { //정기권 진행중일때

    //   let countResult = await db.Query(countQuery,selectOrderResult[0].order_idx)
    //   console.log(selectOrderResult[0].order_idx)
    //   console.log(countResult[0].count)
    //   cnt = selectOrderResult[0].product - countResult[0].count
    //   result.flag = "1";
    //   result.ticket = selectOrderResult[0].product + "박스"
    //   result.use = cnt + "박스"
    //   result.percent = Number(((cnt/selectOrderResult[0].product)*100).toFixed() ) //소수점 제거

    // }
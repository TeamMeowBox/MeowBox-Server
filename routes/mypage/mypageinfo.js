
/*
 Default module
*/
 const express = require('express');
 const router = express.Router();
 const async = require('async');
 const db = require('../../module/pool.js');
 
 // 
// Written By 정경인
// 마이페이지 첫 화면
//
router.get('/:user_idx', async (req, res, next) => {
  let { user_idx } = req.params;
  let catinfo, sendImage ,cnt;

// const chkToken = jwt.verify(req.headers.authorization);
   /*
   if(chkToken == -1) {
       res.status(401).send({
           message : "Access Denied"
       });
   }
   */

  // let chkToken = {};
  // chkToken.email = "1";

  let Query = ` 
                SELECT cats.name as cat_name 
                FROM users,cats 
                WHERE users.idx =? AND users.idx = cats.user_idx 
              `;
  let catResult = await db.Query(Query, [user_idx]);
  Query = `
            SELECT  orders.product AS product, count(*) AS cnt
            FROM orders,reservations 
            WHERE orders.user_idx = ? AND orders.idx = reservations.order_idx
            order by orders.payment_date            
         `;
  let orderResult = await db.Query(Query, [user_idx]);

  if (catResult.length ===0 ) {												// 고양이 유무
    catinfo = 0;
  }else{
    catinfo = catResult[0].cat_name;

  }
  console.log(orderResult[0])
 
  if (!orderResult[0].product) {    //정기권 진행 중이 아닐때
    
    if (!orderResult[0].product || orderResult[0].product === 0) { // 주문기록이 없거나 1달정기권 이용했었던 유저
      sendImage = '나의 고양이에게 미유박스를 선물해 ~~~'; //나의 고양이에게 미유박스를 선물해 ~~~
    } else if (orderResult[0].product === 1) {
      sendImage = '생일 축하해요.'//생일 축하해요.
    } else if (orderResult[0].product === 2) {
      sendImage = '앞으로 잘부탁해요'//앞으로 잘부탁해요
    }

    res.status(200).send({
      status : -1,  //정기권 없음
      data : {
        cat : catinfo,
        iamge : sendImage
      }
    })
  } else { //정기권 진행중일때
    cnt = orderResult[0].product -orderResult[0].cnt;

    res.status(200).send({
      status : 1,   //정기권 있음
      data : {
        cat : catinfo,
        ticket : orderResult[0].product,
        use :cnt
      }
    })
  

  }

})

module.exports = router;

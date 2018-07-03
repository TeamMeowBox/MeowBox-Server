
const express = require('express');
const router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

// 
// Written By 정경인
// 미유박스에 제안 
//
router.post('/', async (req, res, next) => {
 let { user_idx, title, content } = req.body;
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
               INSERT INTO feedbacks(user_idx, title, content)
               VALUES(?,?,?)
             ` 
 try {
  await db.Query(Query, [user_idx,title,content]);
  await res.status(201).send({
      message: "insert Success"
  });
} catch (error) {
  res.status(500).send({
      message: "insert Error"
  });
}

});

module.exports = router;

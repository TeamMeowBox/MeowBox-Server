const express = require('express');
const pool = require('../module/pool.js');
const upload = require('../config/multer.js');
const router = express.Router();
//게시글 작성
router.post('/post',upload.array('post_image'),function(req,res){
    const content =  req.body.content;
    const title = req.body.title;
    const user_idx = req.body.user_idx;
    const post_image = req.files[0].location;
    console.log(req.files[0]);
//안드로이드한테는 userpreference, ios userdafault로 user_idx값을 가지고 있다가 주시면 되요~
 pool.getConnection(function(err, connection) {
        if (err) {
          res.status(500).send({
            message : "Internal Server Error"
          });
          connection.release();
        } else {
            console.log('success connection');
            if(!user_idx){
                res.status(400).send({
                    message : "user_idx error"
                });
                connection.release();
            } else{
                let sql = 'INSERT INTO post(post_content, post_title,user_idx,post_image) VALUES(?,?,?,?);';//insert
                connection.query(sql,[content,title,user_idx,post_image],function(err, result){
                    if(err){
                        res.status(500).send({
                            message : 'parameter error'
                        });
                        connection.release();
                    } else{
                        res.status(201).send({
                            message : "post insert success"
                        });
                        connection.release();
                        console.log("post insert success");
                        };
                    });
                };
            };
      });
});
//게시글 보기
router.get('/post',function(req, res){
    pool.getConnection(function(err, connection) {
        if (err) {
          res.status(500).send({
            message : "Internal Server Error"
          });
          connection.release();
        } else {
            console.log('success connection');
            let sql = 'SELECT post_title, post_content, post_time, user_id FROM post JOIN user USING(user_idx) WHERE post.user_idx=user.user_idx ORDER BY post_time DESC;';
            connection.query(sql,function(err, result){
                if(err){
                    res.status(500).send({
                        message : 'parameter error'
                    });
                    connection.release();
                } else{
                    console.log(result);
                    res.status(201).send({
                        message : result
                    });
                    connection.release();
                    console.log("post data select success");
                    };
                });
            } 
        });  
});
//게시글 삭제
router.delete('/post/:post_idx',function(req, res){
    const post_idx = req.params.post_idx;
    const user_idx = req.body.user_idx;
    pool.getConnection(function(err, connection) {
        if (err) {
          res.status(500).send({
            message : "Internal Server Error"
          });
          connection.release();
        } else {
            console.log('success connection');
            if(!user_idx || !post_idx){
                res.status(400).send({
                    message : "user_idx, post_idx error"
                });
                connection.release();
            } else{
                let sql = 'DELETE FROM post WHERE post_idx = ? AND user_idx = ?';//delete
                connection.query(sql,[post_idx, user_idx],function(err, result){
                    if(err){
                        res.status(500).send({
                            message : 'parameter error'
                        });
                        connection.release();
                    } else{
                        console.log(result);
                        res.status(201).send({
                            message : "success delete post data"
                        });
                        connection.release();
                        console.log("success delete post data");
                        };
                    });
                };
            };
      });
});
//localhost:3000/comment/1
//특정 글의 모든 코멘트 보기, 특정 글의 코멘트 작성 코멘트 삭제 기능
//댓글작성
router.post('/comment/:post_idx',function(req, res){
    const user_idx = req.body.user_idx;
    const content =  req.body.content;
    const post_idx = req.params.post_idx;
    
    pool.getConnection(function(err, connection) {
        if (err) {
          res.status(500).send({
            message : "Internal Server Error"
          });
          connection.release();
        } else {
            console.log('success connection');
            if(!user_idx || !post_idx){
                res.status(400).send({
                    message : "user_idx, post_idx error"
                });
                connection.release();
            } else{
                let sql = 'INSERT INTO comment(comment_content, post_idx, user_idx) VALUES (?,?,?);';//insert
                connection.query(sql,[content,post_idx, user_ix],function(err, result){
                    if(err){
                        res.status(500).send({
                            message : 'parameter error'
                        });
                        connection.release();
                    } else{
                        console.log(result);
                        res.status(201).send({
                            message : "comment insert success"
                        });
                        connection.release();
                        console.log("comment inser success");
                        };
                    });
                };
            };
      });

})
//댓글 보기
router.get('/comment/:post_idx',function(req,res){
    const post_idx = req.params.post_idx;
    const user_idx = req.body.user.idx;
    pool.getConnection(function(err, connection) {
        if (err) {
          res.status(500).send({
            message : "Internal Server Error"
          });
          connection.release();
        } else {
            console.log('success connection');
            if(!user_idx ){
                res.status(400).send({
                    message : "user_idx, post_idx error"
                });
                connection.release();
            } else{
                let sql = 'SELECT comment_content, comment_time, user_id FROM comment JOIN user USING(user_idx) WHERE comment.user_idx=user.user_idx AND post_idx =?';//insert
                connection.query(sql,post_idx,function(err, result){
                    if(err){
                        res.status(500).send({
                            message : 'parameter error'
                        });
                        connection.release();
                    } else{
                        console.log(result);
                        res.status(201).send({
                            message : result
                        });
                        connection.release();
                        console.log("comment select success");
                        };
                    });
                };
            };
      });
});
//코멘트 삭제
router.delete('/comment/:post_idx/:comment_idx',function(req, res){
    const comment_idx = req.params.comment_idx;
    const user_idx = req.body.user_idx;
    const post_idx = req.params.post_idx;

    pool.getConnection(function(err, connection) {
        if (err) {
          res.status(500).send({
            message : "Internal Server Error"
          });
          connection.release();
        } else {
            console.log('success connection');
            if(!user_idx || !comment_idx|| !post_idx){
                res.status(400).send({
                    message : "user_idx, comment error"
                });
                connection.release();
            } else{
                let sql = 'DELETE FROM comment WHERE comment_idx = ? AND user_idx = ? AND post_idx = ?';//delete
                connection.query(sql,[comment_idx, user_idx, post_idx],function(err, result){
                    if(err){
                        res.status(500).send({
                            message : 'parameter error'
                        });
                        connection.release();
                    } else{
                        console.log(result);
                        res.status(201).send({
                            message : "success delete comment data"
                        });
                        connection.release();
                        console.log("success delete cooment data");
                        };
                    });
                };
            };
      });


})




module.exports = router;
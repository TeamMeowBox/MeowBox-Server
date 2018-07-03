const express = require('express');
const pool = require('../config/dbPool.js');
const router = express.Router();

//북마크 post 등록
router.post('/bookmark/:post_idx', function(req, res) {
    let user_idx = req.body.user_idx;
    let post_idx =  req.params.post_idx;
    pool.getConnection(function(err,connection){
        if(err){
            res.status(500).send({
                message :  "Internal Server Error"
            })
        } else{
            if(!user_idx||!post_idx){ //user_idx, store_idx 체크
                res.status(500).send({
                    message : "user_idx, post_idx error"
                });
                connection.release();
                console.log("user_idx, post_idx error");
            } else {
                let sql = "INSERT INTO bookmark(user_idx, post_idx) VALUES (?,?)";
                connection.query(sql,[user_idx, post_idx], function (err, result) {
                    if (err){
                        res.status(500).send({
                            message : "Bookmark parameter INSERT ERROR"
                        });
                        connection.release();
                        console.log("Bookmark parameter INSERT ERROR");
                    } else{
                        res.status(201).send({
                            message : "Successfully INSERT Bookmark Data"
                        });
                        connection.release();
                        console.log("Successfully INSERT Bookmark Data");
                    };
                });
            }
        }
    })
});
//북마크 삭제
router.delete('/bookmark/:user_idx', function(req, res){
    let user_idx = req.params.user_idx;
    pool.getConnection(function(err, connection){
        if(err){
            res.status(500).send({
                message :  "Internal Server Error"
            })
        }else {
            if(!user_idx ||!store_idx){
                res.status(404).send({
                    messgae : "user_idx, store_idx Does not exist."
                });
                connection.release();
                console.log("user_idx, store_idx Does not exist.")
            }else {
                let sql = "SELECT DISTINCT store_name, "+ 
                "GROUP_CONCAT( menu_name SEPARATOR ',') AS menu_name, "+
                "(SELECT count(*) FROM review as r  WHERE r.store_idx = b.store_idx) AS review_count "+ 
                "FROM menu JOIN( bookmark AS b  JOIN store USING(store_idx)) USING(store_idx) "+
                "WHERE b.user_idx = ? "+ 
                "GROUP BY b.store_idx";
      connection.query(sql,[user_idx], function(err, result){
            if (err){
                res.status(500).send({
                    message : "Bookmark parameter GET ERROR"
                });
                connection.release();
                console.log("Bookmark parameter GET ERROR");
                } else{
                res.status(200).send({
                message :"Successfully GET Bookmark Data",
                    data : result
                });
                connection.release();	
                console.log("Successfully GET Bookmark Data");
                    }
                })
            }
        }
    })
})
module.exports = router;

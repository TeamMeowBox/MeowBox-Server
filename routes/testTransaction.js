const express = require('express');
const router = express.Router();
const db = require('../module/pool.js');

router.get('/',async (req,res,next) => {
    let {test1,test2,test3} = req.body
    
    let updateQuery1 = 
    `
    UPDATE test
    SET test = ?, test2 = ?
    WHERE test3 = ?
    `
    
    let insertQuery2 =
    `
    INSERT INTO test (test1,test2,test3)
    VALUES (?,?,?)
    `

    db.Transaction(async (connection) => {
        console.log("query1")
        await connection.query(insertQuery2,["z","x","c"])
        console.log("query2")
        await connection.query(updateQuery1,["ac","2v","6"])
        console.log("end")
    })
})

module.exports = router
const express = require('express');
const router = express.Router();

const db = require('../../module/mongoPool.js')
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// var detail_img = new Schema({
    
// })

// var hashtag = new Schema({

// })

var contentModel = new Schema({
    title : String,
    main_img : String,
    hashtag : [String],
    main_text : String,
    detail_img : [String],
    detail_text : String
})

var package = new Schema({
    package_img : String,
    content : [
        {
            title : String,
            main_img : String,
            hashtag : [String],
            main_text : String,
            detail_img : [String],
            detail_text : String
        }
    ]
})

var testhomes = mongoose.model('testhomes',package)
router.get('/',(req,res) => {
    testhomes.find({},function(error,data){
        console.log(data)
    })
//     var test = db.collection('testhomes').find({})
//     test.toArray((err,result) => {
//         console.log(result)
//     })
//    // test = await db.collections('testhome').find({});

//     console.log(test)
})

module.exports = router;
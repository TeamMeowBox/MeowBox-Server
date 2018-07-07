const express = require('express');
const router = express.Router();

const db = require('../../config/mongoPool.js')
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var contentSchema = new Schema({
    title : String,
    main_img : String,
    hashtag : [{type : String}],
    main_text : String,
    detail_img : [{type : String}],
    detail_text : String
})

var package = new Schema({
    package_img : String,
    package_date : String,
    content : [{
        title : String,
        main_img : String,
        hashtag : [{type : String}],
        main_text : String,
        detail_img : [{type : String}],
        detail_text : String
    }]
},{Collection : 'testhomes'})

var test = mongoose.model('testhomes',package,'testhomes')
router.get('/',async (req,res,next) => {
    // let {id} = req.params
    try{
        var result = await test.find({});
    } catch(err){
        return res.r(err);
    }
    return res.r(result);
})

module.exports = router;

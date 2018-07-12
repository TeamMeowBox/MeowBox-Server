const express = require('express');
const router = express.Router();

const db = require('../../config/mongoPool');
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

var frame = {
    title : String,
    comment : String,
    image_list : [String],
    hashtag : [String],
    insta_id : [String]
}


var reviewSchema = new Schema({
    content : {
        "birthday" : frame,
        "best_image_7" : frame
    }
},{
    versionKey: false // You should be aware of the outcome after set to false
});


var test = mongoose.model('review', reviewSchema, 'review');

router.get('/',async (req,res,next) => {
    console.log('here');
    let result;
    try{
        result = await test.find({
        });
    } catch(err){
        return next(err);
    }
    console.log(result[0].content)
    return res.r(result[0].content);
})

module.exports = router;

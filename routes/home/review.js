const express = require('express');
const router = express.Router();

const mongoose = require('mongoose')
const Schema = mongoose.Schema;

var frame = {
    comment : String,
    image_list : [String],
    hashtag : [String],
    insta_id : [String]
}


var reviewSchema = new Schema({
    content : {
        "birthday" : frame,
        "7_best_image" : frame,
        "6_best_image" : frame
    }
},{
    versionKey: false // You should be aware of the outcome after set to false
});


var test = mongoose.model('review', reviewSchema, 'review');

router.get('/',async (req,res,next) => {
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

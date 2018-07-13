const express = require('express');
const router = express.Router();

const db = require('../../config/mongoPool');
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

var frameElement = {
  id: String,
  image : String,
  hash : String,
  insta : String

}

var frame = {
  birthday : [frameElement],
  best_image_7 :[frameElement],
  best_image_6 :[frameElement],
  title : Object,
  comment : Object
}


var reviewSchema = new Schema({
  content: frame
}, {
    versionKey: false // You should be aware of the outcome after set to false
  });


var test = mongoose.model('review_web', reviewSchema, 'review_web');

router.get('/', async (req, res, next) => {
  console.log('here');
  let result;
  try {
    result = await test.find({
    });
  } catch (err) {
    return next(err);
  }
  return res.r(result[0].content);
})

module.exports = router;

const express = require('express');
const router = express.Router();

const Instagram = require('node-instagram').default;

const instagram = new Instagram({
    clientId : 'dfd1d10fed4d4676adca61c8e1a03658',
    clientSecret : '82925739c42d467295b2b8b6e01909b2',
    accessToken : '8165613682.dfd1d10.d798446cc0ec43ffb23566c880e0bfd7',
    count : 40
})
router.get('/',async (req,res,next) => {

const data = await instagram.get('users/self');

console.log(data)

instagram.get('tags/paris/media/recent').then((data) => {
    res.r(data)
    console.log(data)
  }).catch((err) => {
    // An error occured
    next(err)
    console.log(err);
});
})

module.exports = router


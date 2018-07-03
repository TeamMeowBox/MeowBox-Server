/*
 Declare module
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const async = require('async');
const bodyParser = require('body-parser');
const moment = require('moment');
const db = require('../../module/pool.js');
const multerUpload = require('../../module/multer.js').upload;


/*
 Method : get
 */
 // Written By 서연
 // 계정 설정 화면 보기
router.get('/account_setting/:user_idx', async(req, res) =>{
    let {user_idx} = req.params;
    console.log("test");
    console.log("success connection");
    if(!user_idx){
        res.status(404).send({
            state : 'req.params error'
        })
    } else {
        let accountSelectQuery =
        `
        SELECT users.idx, users.name, users.email, users.phone_number, users.image_profile, image_background,
               cats.name, cats.size, cats.birthday, cats.caution 
        FROM users JOIN cats ON users.idx = cats.user_idx
        WHERE users.idx = cats.user_idx
        AND users.idx = ?
        `;
        try{
            await db.Query(accountSelectQuery,[user_idx]);
            await res.status(200).send({
                state :  'Select Account Success'
            });
        } catch (error) {
            res.status(500).send({
                state : 'Select Account Error'
            });
        }
    }
});
/*
 Method : post
 */
 // Written By 서연
 // 계정 수정
router.post('/account_setting/:user_idx', multerUpload.fields([{ name: 'image_profile' }, { name: 'image_back' }]), async(req, res) => {
    let {user_idx, user_name, user_email, user_phone, image_profile, image_back, cat_name, cat_size, cat_birthday, cat_caution} = req.body;

    console.log(req.files);
    
    console.log('success connection');
    if(!user_idx||!user_name||!user_email||!user_phone||!cat_name||!cat_size||!cat_birthday||!cat_caution){
        res.status(404).send({
            state : 'req.body error'
        })
    } else {
        let usersUpdateQuery =
        `
        UPDATE users 
        SET name = ?, phone_number = ?, email = ?
        WHERE idx = ?
        `; //users_update

        let catsUpdateQuery = 
        `
        UPDATE cats
        SET  name = ?, size = ?, birthday = ?, caution = ?
        WHERE user_idx = ?
        `;//cats_update`

        try{
            await db.Query(usersUpdateQuery,[user_name, user_phone, user_email,user_idx]);
            await res.status(200).send({
                state : 'Update users Success'
            });
        } catch (error) {
            res.status(500).send({
                state : 'Update users Error'
            });
        }
        
        try{
            await db.Query(catsUpdateQuery,[cat_name, cat_size, cat_birthday, cat_caution,user_idx]);
            await res.status(200).send({
                state : 'Update cats Success'
            });
        } catch (error) {
            res.status(500).send({
                state : 'Update cats Error'
            });
        }
    } // End of else    
});

module.exports = router;
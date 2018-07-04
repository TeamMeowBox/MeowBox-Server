/*
 Declare module
 */
const express = require('express');
const router = express.Router();
const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const db = require('../../module/pool.js');
const InstagramCrawler = require('instagram-crawling')

var detailURL = "https://www.maccosmetics.co.kr/product/13854/52593/makeup/liptensity-lipstick#/shade/";

function crawling(idx,size,url){
    console.log('\n' + 'in crawling ' + url);

    if( idx > size ) return;
    return new Promise(function(resolve, reject){
        let baseURL = url;
        request(baseURL, async (error, response, html) => {
            if (!error) {
                const $ = cheerio.load(html);
                var title = $('meta[property="og:image"]').attr('content');
                console.log('title: ' + title);

                let prodID = $('#main_content > div.block.block-system.block-system-main > div > div.site-container > article > div').attr('data-product-id');
                console.log('prodID : ' + prodID);

                let size = $('#product--prod_id-' + prodID + ' > div.product__shade-column > div.shade-picker.js-shade-picker--v1.js-shade-picker > div.shade-picker__colors-mask > ul').children().length;
                console.log(' size : ' + size);
                
                let result = $('#product--prod_id-' + prodID + ' > div.product__shade-column > div.shade-picker.js-shade-picker--v1.js-shade-picker > div.shade-picker__colors-mask > ul > li:nth-child(' + idx + ')');
                let aria_label = result.attr('aria-label');
                console.log('aria-label : ' + aria_label);
                

                    /*
                    // Get Query for [Image Src]
                    let result = $('#product--prod_id-' + prodID + ' > div.product__shade-column > div.shade-picker.js-shade-picker--v1.js-shade-picker > div.shade-picker__colors-mask > ul > li:nth-child(' + idx + ') > div >  div:nth-child(1)');
                    let image_path = result.attr('data-bg-image');
                    */

                    result = $('#product--prod_id-' + prodID + ' > div.product__shade-column > div.shade-picker.js-shade-picker--v1.js-shade-picker > div.shade-picker__colors-mask > ul > li:nth-child(' + idx + ') > div >  div:nth-child(2)');
                    let name = result.attr('title');
                    console.log('name : ' + name);

                    
                    let updateQuery =                 
                    `
                    UPDATE libs_product
                    SET image_path = ? 
                    WHERE name = ? 
                    `;


                    try {
                        await db.query(updateQuery,[title,name]);
                        await crawling(idx+1,size,detailURL+encodeURI(aria_label));
                    } catch (error) {
                        console.log('error : ' + error);

                    }
                
                resolve("Success");
            }
            else {

                console.log('here3');
                reject("Error");
                console.log("We’ve encountered an error: " + error);
            }
        }); // End of request
    });
};

function crawling2(url){
    return new Promise(function(resolve, reject){
        let baseURL = url;
        request(baseURL, async (error, response, body) => {
            if (!error) {
                const $ = cheerio.load(body)
                
                // body > div:nth-child(44) > div.zoomWindowContainer > div

                // 2 Clear
                // let prodID = $('#main_content > div.block.block-system.block-system-main > div > div > div.site-container > article > div').attr('data-product-id');

                let prodID = $('#main_content > div.block.block-system.block-system-main > div > div.site-container > article > div').attr('data-product-id');
                console.log('prodID : ' + prodID);
                let size = $('#product--prod_id-' + prodID + ' > div.product__shade-column > div.shade-picker.js-shade-picker--v1.js-shade-picker > div.shade-picker__colors-mask > ul').children().length;

                for(var i=1; i<=size; i++){


                    
                    // Get Query for [Image Src]
                    let result = $('#product--prod_id-' + prodID + ' > div.product__shade-column > div.shade-picker.js-shade-picker--v1.js-shade-picker > div.shade-picker__colors-mask > ul > li:nth-child(' + i + ') > div >  div:nth-child(1)');
                    let image_path = result.attr('data-bg-image');


                    let result = $('#product--prod_id-' + prodID + ' > div.product__shade-column > div.shade-picker.js-shade-picker--v1.js-shade-picker > div.shade-picker__colors-mask > ul > li:nth-child(' + i + ') > div >  div:nth-child(2)');
                    let name = result.attr('title');
                    console.log('name : ' + name);
                    console.log('image_path : ' +  image_path + '\n');


                    /*
                    // Get Query for [color, name]
                    let result = $('#product--prod_id-' + prodID + ' > div.product__shade-column > div.shade-picker.js-shade-picker--v1.js-shade-picker > div.shade-picker__colors-mask > ul > li:nth-child(' + i + ') > div >  div:nth-child(2)');
                    let color = result.css('background-color');
                    let name = result.attr('title');
                    console.log('color : ' + color);
                    */
                    
                    let insertQuery =                 
                    `
                    INSERT INTO libs_product(id,name,color)
                    VALUES(?,?,?);
                    `;

                    try {
                        // await db.query(insertQuery,[id,name,color]);
                    } catch (error) {
                        res.status(500).send({
                            state : error
                        });
                    }
                }
                resolve("Success");
            }
            else {

                console.log('here3');
                reject("Error");
                console.log("We’ve encountered an error: " + error);
            }
        }); // End of request
    });
};
    


/*
Method : Get
*/

router.post('/', async(req, res, next) => {
let instagram = new InstagramCrawler;
 
// Authorize to save user session
instagram.auth('kkyoung2n_j', 'ruddls114!Z')
    .then(() => instagram.getTagMedia('kiev', 3)) // getTagMedia(Tag Name, Total Number of pages)
    .then(media => {
        console.log(media);
 
        return instagram.getProfileMedia('instagram', 3) // getProfileMedia(Username, Total Number of pages)
    })
    .then(media => {
        console.log(media);
    })
    .catch(error => {
        console.log('====================================================');
         console.error(error);
    });
});




/*
Method : Post
*/

router.post('/2', async(req, res, next) => {
    let baseURL = "https://www.instagram.com/explore/tags/피자"
        request(baseURL, async (error, response, body) => {
            if (!error) {

                const $ = cheerio.load(body);

                console.log('$ : ' + $);

                // #react-root > section > main > article > div.EZdmt > div > div


                const idx_1 = $('#react-root > section > main > article > div.EZdmt > div > div > div:nth-child(1)').attr('a');
                const idx_2 = $('#react-root > section > main > article > div.EZdmt > div > div > div:nth-child(1)').attr('class');
                console.log('idx_1 + ' +  idx_2);

                res.status(200).send({
                    meesage : "Good"
                });
                // #react-root > section > main > article > div.EZdmt > div > div > div:nth-child(1) > div:nth-child(1)
                // #react-root > section > main > article > div.EZdmt > div > div > div:nth-child(1) > div:nth-child(2)
                // #react-root > section > main > article > div.EZdmt > div > div > div:nth-child(1) > div:nth-child(3)



                // #react-root > section > main > article > div.EZdmt > div > div > div:nth-child(2)
                // #react-root > section > main > article > div.EZdmt > div > div > div:nth-child(3)
                





                /*
                var image = $('meta[property="og:image"]').attr('content');
                console.log('image: ' + image);

                var title = $('meta[property="og:title"]').attr('content');
                console.log('title: ' + title);

                let prodID = $('#main_content > div.block.block-system.block-system-main > div > div.site-container > article > div').attr('data-product-id');
                console.log('prodID : ' + prodID);

                let size = $('#product--prod_id-' + prodID + ' > div.product__shade-column > div.shade-picker.js-shade-picker--v1.js-shade-picker > div.shade-picker__colors-mask > ul').children().length;
                console.log(' size : ' + size);

                // await crawling(1,size,baseURL);

                for(var i=1; i<=size; i++){
                    // Get Query for [Image Src]
                    let result = $('#product--prod_id-' + prodID + ' > div.product__shade-column > div.shade-picker.js-shade-picker--v1.js-shade-picker > div.shade-picker__colors-mask > ul > li:nth-child(' + i + ')');
                    let aria_label = result.attr('aria-label');
                    console.log('aria-label : ' + aria_label);
                    
                    result = $('#product--prod_id-' + prodID + ' > div.product__shade-column > div.shade-picker.js-shade-picker--v1.js-shade-picker > div.shade-picker__colors-mask > ul > li:nth-child(' + i + ') > div >  div:nth-child(2)');
                    let name = result.attr('title');
                    console.log('name : ' + name);
                    // console.log('image_path : ' +  image_path + '\n');

                    let selectQuery =
                    `
                    SELECT idx
                    FROM libs_product
                    WHERE name = ?
                    `

                    let selectResult = await db.query(selectQuery,[name]);

                    console.log('idx : ' + selectResult[0].idx);


                    let updateQuery =                 
                    `
                    UPDATE libs_product
                    SET detail_path = ?
                    WHERE idx = ?
                    `;

                    try {    
                        await db.query(updateQuery,[detailURL+aria_label,selectResult[0].idx]);
                        console.log('Update END' + '\n');
                    } catch (error) {
                        res.status(500).send({
                            state : error
                        });
                    }
                    */




                    /*
                    // Get Query for [color, name]
                    let result = $('#product--prod_id-' + prodID + ' > div.product__shade-column > div.shade-picker.js-shade-picker--v1.js-shade-picker > div.shade-picker__colors-mask > ul > li:nth-child(' + i + ') > div >  div:nth-child(2)');
                    let color = result.css('background-color');
                    let name = result.attr('title');
                    console.log('color : ' + color);
                    */
                    
                    
                // } // End of For
                
            }
            else {
                console.log("We’ve encountered an error: " + error);
            }
        }); // End of request
});

module.exports = router;
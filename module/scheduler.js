



const schedule = require('node-schedule');
const db = require('./pool.js');

    schedule.scheduleJob('0 0 0 * * *', async function () {
      console.log("Work Scheduler!");

      let Query = ` 
    	DELETE FROM reservations 
      WHERE  date(delivery_date) > DATE_FORMAT(NOW(),'%Y.%m.%d')
    `
    ;
    await db.Query(Query,[]);
  })

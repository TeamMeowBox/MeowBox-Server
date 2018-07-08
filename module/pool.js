
const async = require('async');
const pool = require('../config/dbPool.js');

/*
 Modularize DB Connection
*/

module.exports = {
  Query : async (...args) => {
    const query = args[0];
    const data = args[1];
    let result;
    try {
      var connection = await pool.getConnection();
      result = await connection.query(query, data) || null;
    }
    catch(err) {
      console.log("mysql error! err log =>" + err);
      next(err);
    }
    finally {
      pool.releaseConnection(connection);
      return result;
    }
  },
  Transaction : async (...args) => {
    console.log("asdfasdf")
    var result;
    try{
      console.log("11111")
       var connection = await pool.getConnection();
       console.log("22222")
       await conenction.beginTransaction();
       console.log("transaction first")
    }catch(err){
      console.log("catch")
      await connection.rollback();
      console.log("rollback")
      next(err)
      pool.releaseConnection(connection)
      result = args
      return result;
    }
    await connection.commit();
    pool.releaseConnection(connection)
    result = args
    return result
  }
};

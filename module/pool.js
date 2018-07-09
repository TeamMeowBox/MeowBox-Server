
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
    var connection = await pool.getConnection();
    console.log("beginTransaction")
    await connection.beginTransaction();
    console.log("result")
    const result = await args[0](connection, ...args).catch(async (err) => {
      console.log("rollback")
      await connection.rollback();
      console.log("releaseConnection")
      pool.releaseConnection(connection)
      throw err
      return result
    })
    console.log("commit")
    await connection.commit();
    console.log("releaseCOnnection")
    pool.releaseConnection(connection)
    console.log("return")
    return result
  }
};

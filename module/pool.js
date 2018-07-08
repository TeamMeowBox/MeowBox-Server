
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
  }
};

module.exports = {
  transaction = fn => async (...args) => {
    // const query = args[0];
    // const data = args[1];
    let result;
    try{
      var connection = await pool.getConnection();
      await connection.beginTransaction();
      result = await connection.query(query,data) || null;
      //result = await fn(connection, ...args)
    }
    catch(err) {
      console.log("transaction err! => "+err)
      connection.rollback();
      pool.releaseConnection(connection);
      return next(err);
    }
    finally {
      await connection.commit();
      pool.releaseConnection(connection);
      return result;
    }
  }
}

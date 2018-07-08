
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

const transaction = fn => async(...args) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  const result = await fn(connection, ...args).catch(async (err) => {
    await connection.rollback();
    pool.releaseConnection(connection)
    next(err)
    return result
  })
  await connection.commit();
  pool.releaseConnection(connection)
  return result
  }

// const transaction = async (...args) => {
//   const connection = await pool.getConnection();
//   await connection.beginTransaction();
//   const result = 

// }

module.exports = transaction 

// module.exports = {
//   transaction : async (...args) => {
//       /* DB 커넥션을 한다. */
//   const connection = await pool.getConnection();
//   /* 트렌젝션 시작 */
//   await connection.beginTransaction();
//   /* 비지니스 로직에 con을 넘겨준다. */
//   const result = await fn(connection, ...args).catch(async (error) => {
//       /* rollback을 진행한다. */
//        await connection.rollback();
//       /* 에러시 con을 닫아준다. */
//       connection.release();
//       throw error;
//   });
//   /* commit을 해준다. */
//   await connection.commit();
//   /* con을 닫아준다. */
//   connection.release();
//   return result;
//   }
// }

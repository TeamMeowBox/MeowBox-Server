// 1. mongoose 모듈 가져오기
const mongoose = require('mongoose');
// 2. testDB 세팅
mongoose.connect('mongodb://localhost:27017/testDB');
// 3. 연결된 testDB 사용
var db = mongoose.connection;
// 4. 연결 실패
db.on('error', function(){
    console.log('Connection Failed!');
});
// 5. 연결 성공
db.once('open', function() {
    console.log('Connected!');
});

module.exports = db;

// const mongoose = require('mongoose');
// module.exports = () => {
//   function connect() {
//     mongoose.connect('localhost:27017',{dbName : 'testDB'}, function(err) {
//       if (err) {
//         console.error('mongodb connection error', err);
//       }
//       console.log('mongodb connected');
//     });
//   }
//   connect();
//   mongoose.connection.on('disconnected', connect);
// };
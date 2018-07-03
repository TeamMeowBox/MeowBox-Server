var multer = require('multer');

var _storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + "." + file.originalname.split('.').pop());
    }
});

var upload = multer({
    storage: _storage
});

module.exports.upload = upload;
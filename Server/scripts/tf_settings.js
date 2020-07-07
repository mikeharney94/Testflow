var fs = require('fs');
var mysql = require('mysql');
exports.getSettings = function () {
  var obj = JSON.parse(fs.readFileSync('../settings.json', 'utf8'));
  return obj;
};

exports.createConnection = function(doConfirm) {
	var db = exports.getSettings().database;
	var con = mysql.createConnection({
	  host: db.host,
	  user: db.user,
	  password: db.password
	});
	con.connect(function(err) {
		if (err) throw err;
		if (doConfirm) console.log('Database Connection Passed');
		return con;
	});
}

exports.testConnection = function() {
	exports.createConnection(true);
};

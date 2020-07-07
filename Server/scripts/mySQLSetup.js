var mysql = require('mysql');

var dbSetupConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "pass@word1"
});

var buildString = "create database testflow;\n"+
"use testflow;\n"+
"create TABLE USER (id varchar (255), username varchar (255), firstname varchar (255), lastname varchar (255), role varchar (255), password varchar (255));";

dbSetupConn.connect(function(err) {
	if (err) throw err;
	console.log("Initiating DB Build");

	dbSetupConn.query("create database testflow", function (err, result) {
		if (err) throw err;
		console.log("Database created");
	});
	
	dbSetupConn.query("use testflow;create TABLE USER (id varchar (255), username varchar (255), firstname varchar (255), lastname varchar (255), role varchar (255), password varchar (255));", function (err, result) {
		if (err) throw err;
		console.log("Database created");
	});
});
/*
conn.connect(function(err) {
  if (err) throw err;
  console.log("Database connection successful");
  
  exports.createTable('User',['name VARCHAR(255)','address VARCHAR(255)'],conn);
});*/

exports.createTable = function(name,columns,conn) {
	var sql = `CREATE TABLE ${name} (`;
	for(var i=0;i<columns.length;i++){
		if(i>0){
			sql += ',';
		}
		sql+=columns[i];
	}
	sql += ')';
	//name VARCHAR(255), address VARCHAR(255))';
	conn.query(sql, function (err, result) {
		if (err) throw err;
		console.log("Table ${name} created");
	});
};
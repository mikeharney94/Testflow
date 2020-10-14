/*Modules*/
var express = require("express");
var multer = require('multer');
var fs = require('fs');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var settings = require('./tf_settings');
var requestHandler = require('./tf_requestHandler');

var app = express(); 
var fileStoreDir = '../../FileStore';

/*Setup*/
var storage =  multer.diskStorage({
  destination: function (req, file, callback) {
	if(!fs.existsSync(fileStoreDir)){
		fs.mkdirSync(fileStoreDir);
	}
    callback(null, fileStoreDir);
  },
  filename: function (req, file, callback) {
	var extension = file.originalname.substr(file.originalname.lastIndexOf('.'), file.originalname.length);
	req.newFileName = req.newFileId + extension;
	callback(null, req.newFileName); //second arg is name of new file
  }
});
var upload = multer({ storage : storage}).single('userPhoto');

app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', settings.getSettings().serverPath);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.post('/login', function(req,res){
	var requestData = req.body;
	var db = settings.getSettings().database;
	var baseSQL = 'SELECT * FROM user WHERE username=? AND password=?';
	var inserts = [requestData.username, requestData.password];
	var queryString = mysql.format(baseSQL, inserts);
	
	var conn = mysql.createConnection({
		host: db.host,
		user: db.user,
		password: db.password,
		database: 'testflow'
	});

	conn.query(queryString, function (err, result, fields) {
		if (err) throw err;
		conn.end();	
		if(!result || result.length == 0){
			return res.status(400).json({
				status: 'error',
				message: 'Either the username or password is incorrect'
			});
		}
		res.send(result);
	});
});

/*Request Handling*/
app.post('/request',function(req,res){
	try{
		var requestData = req.body;
		var db = settings.getSettings().database;
		var action = requestData.action;
		var permissionValidationString = requestHandler.getPermissionValidationString(action,requestData);
		//var queryString = requestHandler.findQuery(action,requestData);
		
		var conn = mysql.createConnection({
			host: db.host,
			user: db.user,
			password: db.password,
			multipleStatements: true,
			database: 'testflow'
		});		
		conn.connect();
		if(!permissionValidationString.isError){
			//permission check
			
			conn.beginTransaction(function(err) {
				if(err){ throw err; }
				conn.query(permissionValidationString, function (err, result, fields) {
					if (err){
						conn.rollback();
						return res.status(400).json({
							status: 'error',
							message: err.toString()
						});
					}
					if(result[0]['result'] != 'true'){
						conn.rollback();
						return res.status(400).json({
							status: 'error',
							message: 'Permission check failed'
						}); 
					}
					if(action == 'delete File'){
						res.send(requestHandler.deleteFile(requestData, fileStoreDir));
					}
					var verifiedRole = result[0]['role'];
					var queryString = requestHandler.findQuery(action,requestData,verifiedRole);
					if(!!queryString.isError){
						conn.rollback();
						return res.status(400).json({
							status: 'error',
							message: queryString.message
						});
					}
					//get result
					conn.query(queryString, function (err, result, fields) {
						if (err){
							conn.rollback();
							return res.status(400).json({
								status: 'error',
								message: err.toString()
							});
						}
						conn.commit(function(err) {
							if (err) {
							  conn.rollback(function() {
								throw err;
							  });
							}
							conn.end();
						});
						var queryResult = requestHandler.handleQueryResult(action,result);
						if(!queryResult){
							return res.status(400).json({
								status: 'error',
								message: 'queryResult did not return a result'
							});
						}else if(queryResult.isError){
							return res.status(400).json({
								status: 'error',
								message: queryResult.message
							});
						}else{
							res.send(queryResult);
						}
					});
				});
			});
		}else{
			conn.end();
			return res.status(400).json({
				status: 'error',
				message: /*queryString.message || */permissionValidationString.message
			});
		}
	}catch(err){
		return res.status(400).json({
			status: 'error',
			message: err.toString()
		});
	}
});

/*File Storage*/
app.post('/api/fileStore',function(req,res){
	req.newFileId = createUUID();
	try{
		upload(req,res,function(err) {
			if(err) {
				return res.end("Error uploading file.");
			}
			res.end(req.newFileName);
		});
	}catch(err){
		console.log(err);
	}
});

function createUUID() {
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
   });
}

app.listen(3000,function(){
	settings.testConnection();
	
	console.log("Server is online");
    console.log("Working on port 3000");
});
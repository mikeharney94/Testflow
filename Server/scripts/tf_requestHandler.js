var settings = require('./tf_settings');
var mysql = require('mysql');
var uuid = require('uuid');
var fs = require('fs');

class tf_Error{
	constructor(msg){
		this.message = msg;
		this.isError = true;
	}
}
exports.findQuery = function(action,requestData,verifiedRole){
	var baseSQL, inserts;
	switch(action){
		case 'searchGrid users':
			return 'SELECT id, username AS "Username", firstname AS "First Name", lastname AS "Last Name", role AS "Role" FROM user';
		case 'searchGrid questions':
			if(verifiedRole == 'admin'){
				return 'SELECT question.id, name AS "Question Name",concat(firstname," ",lastname) AS "Creator Name" FROM question INNER JOIN user ON user.id=question.created_by_id';
			}else{
				baseSQL = 'SELECT question.id, name AS "Name" FROM question INNER JOIN user ON user.id = question.created_by_id WHERE username=? AND password=?';
				inserts = [requestData.username, requestData.password];
				return mysql.format(baseSQL, inserts);
			}
		case 'searchGrid ratings':
			if(verifiedRole == 'admin'){
				return 'SELECT rating.id, name AS "Name", value AS "Value", concat(firstname," ",lastname) AS "Creator" FROM rating INNER JOIN user ON user.id=rating.created_by_id';				
			}else{
				baseSQL = 'SELECT rating.id, name AS "Name", value AS "Value", concat(firstname," ",lastname) AS "Creator" FROM rating INNER JOIN user ON user.id = rating.created_by_id WHERE username=? AND password=?';
				inserts = [requestData.username, requestData.password];
				return mysql.format(baseSQL, inserts);
			}
		case 'searchGrid tests'://need to complete group by
			if(verifiedRole == 'admin'){
				return 'SELECT t.id, t.name AS "Name", Count(tq.id) AS "Questions", concat(u.firstname," ",u.lastname) AS "Creator Name" '+
					'FROM testquestion tq '+
					'INNER JOIN Test t ON tq.test_id = t.id '+
					'INNER JOIN user u ON u.id = t.created_by_id '+
					'GROUP BY tq.test_id';
			}else if(verifiedRole == 'teacher'){
				baseSQL = 'SELECT t.id, t.name AS "Name", Count(tq.id) AS "Questions" '+
					'FROM testquestion tq '+
					'INNER JOIN Test t ON tq.test_id = t.id '+
					'INNER JOIN user u ON u.id = t.created_by_id '+
					'WHERE u.username = ? AND u.password = ? '+
					'GROUP BY tq.test_id';
				inserts = [requestData.username, requestData.password];
				return mysql.format(baseSQL, inserts);
			}
		case 'searchGrid classes':
			baseSQL = 'SELECT c.id, c.name As "Name", concat(t.firstname," ",t.lastname) AS "Teacher" '+
					'FROM class c '+
					'INNER JOIN User t ON t.id = c.teacher_id';
			if(verifiedRole != 'teacher' && verifiedRole != 'admin'){
				baseSQL += ' INNER JOIN ClassMember cm ON cm.class_id=c.id '+
					'INNER JOIN User s ON s.id = cm.student_id '+
					'WHERE s.username = ? AND s.password = ?';
			}
			inserts = [requestData.username, requestData.password];
			return mysql.format(baseSQL, inserts);
		case 'add User':
			if(requestData.their_username.length > 0 && requestData.their_password.length > 0){
				var guid = uuid.v4();
				baseSQL = "INSERT INTO user (id, username, firstname, lastname, role, password) VALUES (?, ?, ?, ?, ?, ?)";
				inserts = [guid, requestData.their_username, requestData.firstname, requestData.lastname, requestData.role, requestData.their_password];
				return mysql.format(baseSQL, inserts);
			}else{
				return new tf_Error('Either the username or password are of insufficient length');
			}
		case 'get User':
			baseSQL = "SELECT id, username, firstname, lastname, role, IF(role='admin' OR username=?,password,NULL) AS password FROM User WHERE id=?";
			inserts = [requestData.username,requestData.their_id];
			return mysql.format(baseSQL, inserts);
		case 'update User':
			if(requestData.their_username.length > 0 && requestData.their_password.length > 0){
				if(verifiedRole == 'admin'){
					baseSQL = "UPDATE user SET username = ?, firstname = ?, lastname = ?, role = ?, password = ? WHERE id = ?";
					inserts = [requestData.their_username, requestData.firstname, requestData.lastname, requestData.role, requestData.their_password, requestData.their_id];
				}else{
					baseSQL = "UPDATE user SET username = ?, password = ? WHERE id = ?";
					inserts = [requestData.their_username, requestData.their_password, requestData.their_id];
				}
				return mysql.format(baseSQL, inserts);
			}else{
				return new tf_Error('Either the username or password are of insufficient length');
			}
		case 'delete User':
			baseSQL = "DELETE FROM user WHERE id=?";
			inserts = [requestData.their_id];
			return mysql.format(baseSQL, inserts);
		case 'add Question':
			if(!requestData.components || requestData.components.length == 0){
				return new tf_Error('Components are required in order to add a question');
			}
			var questionId = uuid.v4();//name,created_by_id
			baseSQL = 'INSERT INTO Question (id, name, created_by_id) VALUES (?, ?, (SELECT id FROM user WHERE username=? AND password=?))';
			inserts = [questionId, requestData.name, requestData.username, requestData.password];
			for(var i=0;i<requestData.components.length;i++){//name,type,content,answer,weight,x,y,questionId
				var component_i = requestData.components[i];
				var componentId = uuid.v4();
				baseSQL += ";INSERT INTO QuestionComponent (id, name, type, content, answer, weight, x, y, questionId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
				var newInserts = [componentId, component_i.name, component_i.type, component_i.content, component_i.answer, component_i.weight, component_i.x, component_i.y, questionId];
				inserts = inserts.concat(newInserts);
			}
			return mysql.format(baseSQL, inserts);
		case 'get Question':
			baseSQL = "SELECT id, name, created_by_id FROM Question WHERE id=?;";
			baseSQL += "SELECT id, name, type, content, answer, weight, x, y, questionId FROM QuestionComponent WHERE questionId=?";
			inserts = [requestData.questionId, requestData.questionId];
			return mysql.format(baseSQL, inserts);
		case 'update Question':
			baseSQL = "UPDATE question SET name = ? WHERE id = ?";
			inserts = [requestData.name, requestData.questionId];
			
			if(requestData.componentsToAdd){
				for(var i=0;i<requestData.componentsToAdd.length;i++){
					var component_i = requestData.componentsToAdd[i];
					var componentId = uuid.v4();
					baseSQL += ";INSERT INTO QuestionComponent (id, name, type, content, answer, weight, x, y, questionId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
					var newInserts = [componentId, component_i.name, component_i.type, component_i.content, component_i.answer, component_i.weight, component_i.x, component_i.y, requestData.questionId];
					inserts = inserts.concat(newInserts);
				}			
			}
			
			if(requestData.componentsToUpdate){
				for(var i=0;i<requestData.componentsToUpdate.length;i++){
					var component_i = requestData.componentsToUpdate[i];
					baseSQL += ";UPDATE QuestionComponent SET name = ?, type = ?, content = ?, answer = ?, weight = ?, x = ?, y = ? WHERE id = ?";
					var newInserts = [component_i.name, component_i.type, component_i.content, component_i.answer, component_i.weight, component_i.x, component_i.y, component_i.id];
					inserts = inserts.concat(newInserts);
				}
			}
			
			if(requestData.componentsToDelete){
				for(var i=0;i<requestData.componentsToDelete.length;i++){
					var component_i_id = requestData.componentsToDelete[i];
					baseSQL += ";DELETE FROM QuestionComponent WHERE id = ?";
					var newInserts = [component_i_id];
					inserts = inserts.concat(newInserts);
				}
			}
			return mysql.format(baseSQL, inserts);
		case 'delete Question':
			baseSQL = "DELETE FROM QuestionComponent WHERE questionId=?;DELETE FROM question WHERE id = ?";
			inserts = [requestData.questionId, requestData.questionId];
			return mysql.format(baseSQL, inserts);
		case 'add Rating':
			var ratingId = uuid.v4();
			baseSQL = "INSERT INTO rating (id, name, value, created_by_id) VALUES (?, ?, ?, (SELECT id FROM user WHERE username=? AND password=?))";
			inserts = [ratingId, requestData.name, requestData.value, requestData.username, requestData.password];
			return mysql.format(baseSQL, inserts);
		case 'get Rating':
			baseSQL = "SELECT id, name, value, created_by_id FROM rating WHERE id=?";
			inserts = [requestData.rating_id];
			return mysql.format(baseSQL, inserts);
		case 'update Rating':
			if(requestData.name.length > 0 && requestData.value.length > 0){
				baseSQL = "UPDATE rating SET name = ?, value = ? WHERE id = ?";
				inserts = [requestData.name, requestData.value, requestData.rating_id];
				return mysql.format(baseSQL, inserts);
			}else{
				return new tf_Error('Either the name or value fields are of insufficient length');
			}
		case 'delete Rating':
			baseSQL = "DELETE FROM rating WHERE id=?";
			inserts = [requestData.rating_id];
			return mysql.format(baseSQL, inserts);
		case 'add Test':
			var testId = uuid.v4();
			baseSQL = 'INSERT INTO Test (id, name, created_by_id) VALUES (?, ?, (SELECT id FROM user WHERE username=? AND password=?));';
			inserts = [testId, requestData.name, requestData.username, requestData.password]
			
			if(!requestData.testQuestionsToAdd){
				return new tf_Error('Tests require at least one question');
			}
			
			for(var i=0;i<requestData.testQuestionsToAdd.length;i++){
				var q = requestData.testQuestionsToAdd[i];
				var testQuestionId = uuid.v4();
				baseSQL += 'INSERT INTO testquestion (id, test_id, question_id, rating_id, operator, order_number) VALUES (?, ?, ?, ?, ?, ?);';
				var newInserts = [testQuestionId, testId, q.questionId, q.difficultyId, q.operator, q.order];
				inserts = inserts.concat(newInserts);
			}
			return mysql.format(baseSQL, inserts);
		case 'get Test':
			baseSQL = "select id, name from Test where id=?;";
			baseSQL += "select tq.id, q.name, tq.question_id, tq.rating_id, r.name AS 'rating', tq.operator, tq.order_number "+
						"from testquestion tq "+
						"inner join question q on q.id=tq.question_id "+
						"inner join rating r on r.id=tq.rating_id "+
						"where test_id=?";
			inserts = [requestData.id, requestData.id];
			return mysql.format(baseSQL, inserts);
		case 'update Test':
			baseSQL = 'UPDATE test SET name = ? WHERE id = ?';
			inserts = [requestData.name, requestData.id];
			
			if(requestData.testQuestionsToAdd){
				for(var i=0;i<requestData.testQuestionsToAdd.length;i++){
					var testq_i = requestData.testQuestionsToAdd[i];
					var testQuestionId = uuid.v4();
					baseSQL += ";INSERT INTO testquestion (id, test_id, question_id, rating_id, operator, order_number) VALUES (?, ?, ?, ?, ?, ?)";
					var newInserts = [testQuestionId, requestData.id, testq_i.questionId, testq_i.difficultyId, testq_i.operator, testq_i.order];
					inserts = inserts.concat(newInserts);
				}			
			}
			
			if(requestData.testQuestionsToUpdate){
				for(var i=0;i<requestData.testQuestionsToUpdate.length;i++){
					var testq_i = requestData.testQuestionsToUpdate[i];
					baseSQL += ";UPDATE testquestion SET question_id = ?, rating_id = ?, operator = ?, order_number = ? WHERE id = ?";
					var newInserts = [testq_i.questionId, testq_i.difficultyId, testq_i.operator, testq_i.order, testq_i.id];
					inserts = inserts.concat(newInserts);
				}
			}
			
			if(requestData.testQuestionsToDelete){
				for(var i=0;i<requestData.testQuestionsToDelete.length;i++){
					var delete_id = requestData.testQuestionsToDelete[i];
					baseSQL += ";DELETE FROM testQuestion WHERE id = ?";
					var newInserts = [delete_id];
					inserts = inserts.concat(newInserts);
				}
			}
			return mysql.format(baseSQL, inserts);
		case 'delete Test':
			baseSQL = 'DELETE FROM testQuestion WHERE test_id=?;';
			baseSQL += 'DELETE FROM test WHERE id=?';
			inserts = [requestData.id, requestData.id];
			return mysql.format(baseSQL, inserts);
		case 'add Class':
			var classId = uuid.v4();
			baseSQL = 'INSERT INTO Class (id, name, teacher_id) VALUES (?, ?, ?);';
			inserts = [classId, requestData.name, requestData.teacher_id];
			
			if(!requestData.relatedItemsToAdd){
				return new tf_Error('Classes require at least one member');
			}
			
			for(var i=0;i<requestData.relatedItemsToAdd.length;i++){
				var student = requestData.relatedItemsToAdd[i];
				var classMemberId = uuid.v4();
				baseSQL += 'INSERT INTO classmember (id, class_id, student_id, difficulty_id) VALUES (?, ?, ?, ?);';
				var newInserts = [classMemberId, classId, student.student_id, student.difficulty_id];
				inserts = inserts.concat(newInserts);
			}
			return mysql.format(baseSQL, inserts);
		case 'get Class':
			baseSQL = "select c.id, c.name, concat(u.firstname,' ',u.lastname) AS 'teacher', c.teacher_id FROM Class c INNER JOIN user u on u.id = c.teacher_id where c.id = ?;";
			baseSQL += "select cm.id, cm.difficulty_id, cm.student_id, c.name AS 'class', concat(u.firstname, ' ', u.lastname) AS 'name', r.name AS 'rating' "+
				"from classmember cm " +
				"inner join class c on c.id = cm.class_id "+
				"inner join user u on u.id = cm.student_id "+
				"inner join rating r on r.id = cm.difficulty_id "+
				"where cm.class_id = ?";
			inserts = [requestData.id, requestData.id];
			return mysql.format(baseSQL, inserts);
		case 'update Class':
			baseSQL = 'UPDATE class SET name = ?, teacher_id = ? WHERE id = ?';
			inserts = [requestData.name, requestData.teacher_id, requestData.id];
			
			if(requestData.relationshipsToAdd){
				for(var i=0;i<requestData.relationshipsToAdd.length;i++){
					var relationship_i = requestData.relationshipsToAdd[i];
					var relationshipId = uuid.v4();
					baseSQL += ";INSERT INTO classmember (id, class_id, student_id, difficulty_id) VALUES (?, ?, ?, ?)";
					var newInserts = [relationshipId, requestData.id, relationship_i.related_id, relationship_i.difficulty_id];
					inserts = inserts.concat(newInserts);
				}			
			}
			
			if(requestData.relationshipsToUpdate){
				for(var i=0;i<requestData.relationshipsToUpdate.length;i++){
					var relationship_i = requestData.relationshipsToUpdate[i];
					baseSQL += ";UPDATE classmember SET class_id = ?, student_id = ?, difficulty_id = ? WHERE id = ?";
					var newInserts = [requestData.id, relationship_i.related_id, relationship_i.difficulty_id, relationship_i.id];
					inserts = inserts.concat(newInserts);
				}
			}
			
			if(requestData.relationshipsToDelete){
				for(var i=0;i<requestData.relationshipsToDelete.length;i++){
					var delete_id = requestData.relationshipsToDelete[i];
					baseSQL += ";DELETE FROM classmember WHERE id = ?";
					var newInserts = [delete_id];
					inserts = inserts.concat(newInserts);
				}
			}
			return mysql.format(baseSQL, inserts);
		case 'delete Class':
			baseSQL = 'DELETE FROM classmember WHERE class_id=?;';
			baseSQL += 'DELETE FROM class WHERE id=?';
			inserts = [requestData.id, requestData.id];
			return mysql.format(baseSQL, inserts);			
		default:
			return new tf_Error('The action - "'+action+'" is invalid');
	}
}

//mostly for the purpose of custom error messages and post-processing
exports.handleQueryResult = function(action,queryResult){
	debugger;
	switch(action){
		/*case 'login':
			if(!queryResult || queryResult.length == 0){
				return new tf_Error('Either the username or password is incorrect');
			}else{
				return queryResult;
			}*/
		default:
			return queryResult;
	}
}

//returns [isValid, user's role]
exports.getPermissionValidationString = function(action,requestData){
	var baseSQL, inserts;
	switch(action){
		case 'searchGrid users':
			baseSQL = 'SELECT if(role="admin","true",NULL) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];
			break;
		case 'add User':
			baseSQL = 'SELECT if(role="admin","true",NULL) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];
			break;
		case 'get User':
			//Either their_id matches my username and password or I am an admin or teacher
			baseSQL = 'SELECT if(id=? OR role IN ("admin","teacher"),"true",NULL) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.their_id, requestData.username, requestData.password];
			break;
		case 'update User': //for updating yourself
			baseSQL = 'SELECT IF(role="admin","true",IF(role in ("teacher","student") AND id=?,"true","false")) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.their_id, requestData.username, requestData.password];
			break;
		case 'delete User':
			baseSQL = 'SELECT if(role="admin","true",NULL) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];
			break;
		case 'searchGrid questions':
			baseSQL = 'SELECT if(role IN ("admin","teacher"),"true",NULL) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];
			break;
		case 'add Question':
			baseSQL = 'SELECT if(role IN ("admin","teacher"),"true",NULL) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];
			break;
		case 'get Question':
			baseSQL = 'SELECT if(role IN ("admin","teacher"),"true",NULL) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];
			break;
		case 'update Question': //if you're an admin or if you created the question
			baseSQL = 'SELECT IF(role="admin","true",IF((SELECT created_by_id FROM question WHERE id=?) = id,"true","false")) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.questionId, requestData.username, requestData.password];
			break;
		case 'delete Question': //if you're an admin or if you created the question
			baseSQL = 'SELECT IF(role="admin","true",IF((SELECT created_by_id FROM question WHERE id=?) = id,"true","false")) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.questionId, requestData.username, requestData.password];
			break;
		case 'searchGrid ratings':
			baseSQL = 'SELECT if(role IN ("admin","teacher"),"true",NULL) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];
			break;
		case 'add Rating':
			baseSQL = 'SELECT if(role="admin","true",NULL) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];			
			break;
		case 'get Rating': //any valid user
			baseSQL = 'SELECT "true" AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];			
			break;
		case 'update Rating': //admin or creator
			baseSQL = 'SELECT IF(role="admin","true",IF((SELECT created_by_id FROM rating WHERE id=?) = id,"true","false")) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.rating_id, requestData.username, requestData.password];
			break;
		case 'delete Rating': //admin or creator
			baseSQL = 'SELECT IF(role="admin","true",IF((SELECT created_by_id FROM rating WHERE id=?) = id,"true","false")) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.rating_id, requestData.username, requestData.password];
			break;
		case 'searchGrid tests':
			baseSQL = 'SELECT if(role IN ("admin","teacher"),"true",NULL) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];			
			break;
		case 'add Test':
			baseSQL = 'SELECT if(role IN ("admin","teacher"),"true",NULL) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];
			break;
		case 'get Test': //any valid user - answers nor question content are included in result
			baseSQL = 'SELECT "true" AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];			
			break;
		case 'update Test': //admin or creator
			baseSQL = 'SELECT IF(role="admin","true",IF((SELECT created_by_id FROM test WHERE id=?) = id,"true","false")) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.id, requestData.username, requestData.password];
			break;
		case 'delete Test': //admin or creator
			baseSQL = 'SELECT IF(role="admin","true",IF((SELECT created_by_id FROM test WHERE id=?) = id,"true","false")) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.id, requestData.username, requestData.password];
			break;
		case 'searchGrid classes': //any valid user
			baseSQL = 'SELECT "true" AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];		
			break;
		case 'add Class': //teacher or admin
			baseSQL = 'SELECT if(role IN ("admin","teacher"),"true",NULL) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];
			break;
		case 'get Class': //any valid user
			baseSQL = 'SELECT "true" AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];	
			break;
		case 'update Class': // class's teacher_id or admin
			baseSQL = 'SELECT IF(role="admin","true",IF((SELECT teacher_id FROM class WHERE id=?) = id,"true","false")) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.id, requestData.username, requestData.password];			
			break;
		case 'delete Class': //class's teacher_id or admin
			baseSQL = 'SELECT IF(role="admin","true",IF((SELECT teacher_id FROM class WHERE id=?) = id,"true","false")) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.id, requestData.username, requestData.password];			
			break;
		case 'delete File': //teacher or admin
			baseSQL = 'SELECT if(role IN ("admin","teacher"),"true",NULL) AS result,role FROM user WHERE username=? AND password=?';
			inserts = [requestData.username, requestData.password];
			break;			
		default:
			return new tf_Error('Action not handled by permission validation');
	}
	return mysql.format(baseSQL, inserts);
}

exports.deleteFile = function(requestData, fileStoreDir){
	//var fileStoreDir = '../../FileStore';
	try {
	  fs.unlinkSync(fileStoreDir + '/' + requestData.filename);
	  //file removed
	} catch(err) {
	  return new tf_Error(err);
	}
}
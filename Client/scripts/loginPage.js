function login(){
	$.getJSON("../settings.json", function(json) {
		var url = json.serverPath;
		var info = {};
		info.action = 'login';
		info.username = document.getElementById('username').value;
		info.password = document.getElementById('password').value;
			$.ajax({
				url: url + "/login",
				type:"POST",
				dataType:"json",
				contentType: "application/json",
				data: JSON.stringify(info),
				success: function(data, textStatus, jqXHR){
					initTestflowItem(data, this.url);
					top.loadNavbarByRole(data[0].role);
					top.document.getElementById('fullname').innerText = data[0].firstname + " " + data[0].lastname;
					top.document.getElementById('fullname').setAttribute("href","Client/pages/users.html?id="+data[0].id);
					top.document.getElementById('mainContent').style.display='';
					top.document.getElementById('loginFrame').style.display='none';
					top.document.getElementById('mainFrame').contentWindow.loginInit();
					
					document.getElementById('password').value = '';
				},
				error: function(jqXHR, textStatus, errorThrown){
					try{
						top.throwError(JSON.parse(jqXHR.responseText).message || errorThrown);
					}catch{
						top.throwError("Error string:" + errorThrown);
					}
				}
			});
		});
	};
	
function initTestflowItem(userData, loginUrl){
	var testflow = [];
	testflow.user = userData[0];
	testflow.requestUrl = loginUrl.replace('login', 'request');
	testflow.fileStoreUrl = loginUrl.replace('login', 'api/fileStore');
	
	var labelDict = new Map();
	testflow.labelDict = labelDict;
	
	testflow.getTableLabel = function(table){
		var dictResult = this.labelDict.get(table);
		if(dictResult){
			return dictResult;
		}else{
			return table.charAt(0).toUpperCase() + table.slice(1);
		}
	}
	testflow.navigate = function(path){
		top.document.getElementById('mainFrame').src = path;
	}
	
	top.testflow = testflow;
}
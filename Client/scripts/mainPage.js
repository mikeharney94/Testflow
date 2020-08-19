function logout(){
	document.getElementById('mainContent').style.display='none';
	document.getElementById('loginFrame').style.display='';
	document.getElementById('mainFrame').src = 'Client/pages/home.html'

	unloadNavbarByRole(testflow.user.role);	
	testflow = undefined;
}

function returnNavbarLinks(role){
	switch(role){
		case 'admin':
			return [['Questions','Client/pages/searchGrid.html?table=questions'],
			['Tests','Client/pages/searchGrid.html?table=tests'],
			['Users','Client/pages/searchGrid.html?table=users'],
			['Ratings','Client/pages/searchGrid.html?table=ratings'],
			['Classes','Client/pages/searchGrid.html?table=classes']];
			break;
		case 'teacher':
			return [['Questions','Client/pages/searchGrid.html?table=questions'],
			['Tests','Client/pages/searchGrid.html?table=tests'],
			['Ratings','Client/pages/searchGrid.html?table=ratings'],
			['Classes','Client/pages/searchGrid.html?table=classes']];
			break;
		default:
			return [];
	}
}

function createNavbarSection(label,pagelink){
	var section = document.createElement('a');
	section.setAttribute('href', pagelink);
	section.setAttribute('target','mainFrame');
	section.innerText = label;
	section.id = "navbar-"+label;
	
	document.getElementById('navbar-content').appendChild(section);
}

function removeNavbarSection(label){
	var sec = document.getElementById('navbar-'+label);
	sec.parentElement.removeChild(sec);
}

function loadNavbarByRole(role){
	var content = returnNavbarLinks(role);
	for(var i=0;i<content.length;i++){
		createNavbarSection(content[i][0],content[i][1]);
	}
}

function unloadNavbarByRole(role){
	var content = returnNavbarLinks(role);
	for(var i=0;i<content.length;i++){
		removeNavbarSection(content[i][0]);
	}
}

function throwError(message){
	document.getElementById('error_desc').innerText = message;
	$("#errorModal").modal({
		fadeDuration: 100
	});
}

function displayNotification(message, afterFunction){
	document.getElementById('notif_desc').innerText = message;
	$("#notificationModal").modal({
		fadeDuration: 100
	});
}
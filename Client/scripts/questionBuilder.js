var fieldCounter = 1;
var deletedComponents = [];

//removes a component from the form.
function deleteQuestionField(delBtn){
	var card = delBtn.parentElement.parentElement;
	if(card.id != "undefined"){
		deletedComponents.push(card.id);
	}
	document.getElementById('entryField').removeChild(card);
}
function headerTitleInputMode(headerTitle){
	var currentText = headerTitle.innerText;
	var input = document.createElement('input');
	input.value = currentText;
	input.setAttribute('onblur','headerTitleNormalMode(this)');
	headerTitle.innerText = '';
	headerTitle.appendChild(input);
}
function headerTitleNormalMode(headerTitleInputNode){
	var currentText = headerTitleInputNode.value;
	headerTitleInputNode.parentElement.innerText = currentText;
}
function editWithModal(editBtn,type){
	var modal = document.getElementById(type);
	var card = editBtn.parentElement.parentElement.parentElement;
	var component;
	clearModal(type);
	switch(type){
		case 'multipleChoiceModal':
			component = multipleChoiceFieldToComponent(card);
			componentToMultipleChoiceModal(component);
			break;
		case 'lineGraphModal':
			component = lineGraphFieldToComponent(card);
			componentToLineGraphModal(component);
			break;			
	}
	card.parentElement.removeChild(card);
	$("#" + type).modal();
}
//creates a component with the bodyNode content on the form.
function addQuestionField(bodyNode,type,width='',bodyPadding=true,triggersEditModal=false,originalComponent){
	var editHTML = '';
	var name, x, y, id;
	if(triggersEditModal){
		editHTML = '<span aria-hidden="true"><img src="../images/edit.svg" width="20px" height="20px" style="float:right;margin-right:15px" onclick="editWithModal(this,\''+type+'Modal\')"/></span>';
	}
	if(!originalComponent || !originalComponent.name){
		name = 'Component ' + fieldCounter;
		fieldCounter++;
	}else{
		name = originalComponent.name;
		x = originalComponent.x;
		y = originalComponent.y;
		id = originalComponent.id;
	}
	var card = document.createElement('div');
	card.className = 'card draggable ' +type+'Field';				
	card.style.width = width; //formerly default '400px'
	card.style.position = 'absolute';
	card.style.minWidth = '400px';
	card.style.left = x;
	card.style.top = y;
	card.id = id;
	card.type = type;
	card.innerHTML ='<div class="card-header">' +
						'<headerTitle>'+name+'</headerTitle>' +
						'<button type="button" class="close" aria-label="Close" onclick="deleteQuestionField(this)">' +
							'<span aria-hidden="true">&times;</span>' +
						'</button>' +
						editHTML +
					'</div>' +
					'<div class="card-body"></div>';
	card.getElementsByTagName('headerTitle')[0].setAttribute('ondblclick','headerTitleInputMode(this)');
	var cardBody = card.getElementsByClassName('card-body')[0];
	if(!bodyPadding){
		cardBody.style.padding = '0px';
	}
	cardBody.appendChild(bodyNode);
	document.getElementById('entryField').appendChild(card);
	updateDraggables();
}
function addImageField(){
	var outer = document.createElement('div');
	var p1 = document.createElement('p');
	var p2 = document.createElement('p');
	var p3 = document.createElement('p');
	var p4 = document.createElement('p');
	var input = document.createElement('input');
	input.className = 'imageInput';
	input.setAttribute('type','file');
	input.setAttribute('accept','image/*');
	input.setAttribute('onChange','loadFile(event)');
	var output = document.createElement('img');
	output.setAttribute('width','200');
	output.setAttribute('height','200');
	var heightInput = document.createElement('input');
	heightInput.setAttribute('onchange',"changeImageSize(this,'height')");	
	var widthInput = document.createElement('input');
	widthInput.setAttribute('onchange',"changeImageSize(this,'width')");
	p1.appendChild(input);
	p2.appendChild(output);
	p3.innerText = 'Width: ';
	p3.appendChild(widthInput);
	p4.innerText = 'Height :';
	p4.appendChild(heightInput);
	outer.appendChild(p1);
	outer.appendChild(p2);
	outer.appendChild(p3);
	outer.appendChild(p4);
	heightInput.value = 200;
	widthInput.value = 200;
	addQuestionField(outer, 'file');
}
function addTextEntryField(id){
	var inner = document.createElement('div');
	var question = document.createElement('p');
	question.innerText = 'Q:';
	var answer = document.createElement('p');
	answer.innerText = 'A:';
	var qinput = document.createElement('input');
	qinput.setAttribute('type','text');
	qinput.style.width = '100%';
	var ainput = document.createElement('input');
	ainput.setAttribute('type','text');
	ainput.style.width = '100%';
	question.appendChild(qinput);
	answer.appendChild(ainput);
	inner.appendChild(question);
	inner.appendChild(answer);
	addQuestionField(inner,'textEntry');
}
function addTextField(id){
	var input = document.createElement('input');
	input.setAttribute('type','text');
	input.style.width = '100%';
	addQuestionField(input,'text');
}
function multipleChoiceOptionToggleActive(thisOption){
	if(thisOption.classList.contains('active')){
		thisOption.classList.remove('active');
	}else{
		thisOption.classList.add('active');
	}
}

function loadFile(event){
	var fieldDiv = event.srcElement.parentElement.parentElement.parentElement.parentElement;
	if(fieldDiv.id){
		fieldDiv.classList.add('fileUpdated');
		fieldDiv.originalFileName = event.target.files[0].name;
	}else{
		fieldDiv.classList.add('fileAdded');
	}
	var image = fieldDiv.getElementsByTagName('img')[0];
	/*var extension = event.target.files[0].name.split('.')[1];
	newFileName = extension;*/
	image.src = URL.createObjectURL(event.target.files[0]);
	image.setAttribute('name', event.target.files[0].name);
}
function changeImageSize(srcElement, vector){
	var img = srcElement.parentElement.parentElement.getElementsByTagName('img')[0];
	img.setAttribute(vector, srcElement.value);
}
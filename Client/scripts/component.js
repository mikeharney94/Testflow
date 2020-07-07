class Component{
	constructor(name,type,content,answer,weight,x,y,id){
		this.name = name;
		this.type = type;
		this.content = content;
		this.answer = answer;
		this.weight = weight;
		this.x = x;
		this.y = y;
		if(id != "undefined"){
			this.id = id;
		}else{
			id = undefined;
		}
	}
	Component(type){
		this.type = type;
	}
	static defaultComponent(name,type){
		return new Component(name,type,undefined,undefined,undefined,'','','');
	}
}
function isComponentDifferent(com1,com2){
	return !(com1.id == com2.id &&
		com1.name == com2.name &&
		com1.type == com2.type &&
		com1.content == com2.content &&
		com1.answer == com2.answer &&
		com1.weight == com2.weight &&
		com1.x == com2.x &&
		com1.y == com2.y);
}

function isComponentDifferent_notId(com1,com2){
	return !(com1.name == com2.name &&
		com1.type == com2.type &&
		com1.content == com2.content &&
		com1.answer == com2.answer &&
		com1.weight == com2.weight &&
		com1.x == com2.x &&
		com1.y == com2.y);
}

function fieldToComponent(card){
	switch(card.type){
		case 'multipleChoice':
			return multipleChoiceFieldToComponent(card);
		case 'textEntry':
			return textEntryFieldToComponent(card);
		case 'lineGraph':
			return lineGraphFieldToComponent(card);
		case 'text':
			return textFieldToComponent(card);
		case 'file':
			return fileFieldToComponent(card);
		default:
			top.throwError('Field type ' + card.type + 'is not supported');
	}
}

function componentToField(component){
	switch(component.type){
		case 'multipleChoice':
			return multipleChoiceComponentToField(component);
		case 'textEntry':
			return textEntryComponentToField(component);
		case 'lineGraph':
			return lineGraphComponentToField(component);
		case 'text':
			return textComponentToField(component);
		case 'file':
			return fileComponentToField(component);
		default:
			top.throwError('Field type ' + component.type + ' is not supported');
	}		
}

function getFieldName(card){
	var headerTitle = card.getElementsByTagName('headerTitle')[0];
	if(headerTitle.innerText){
		return headerTitle.innerText;
	}else{
		return headerTitle.firstElementChild.value;
	}
}

function textComponentToField(component){
	var input = document.createElement('input');
	input.setAttribute('type','text');
	input.style.width = '100%';
	input.value = component.content;
	addQuestionField(input,'text',undefined,undefined,false,component);
}
function textFieldToComponent(card){
	var name = getFieldName(card);
	var type = 'text';
	var content = card.getElementsByTagName('input')[0].value;
	var answer = null;
	var weight = null;
	var x = card.style.left;
	var y = card.style.top;
	var id = card.getAttribute('id');
	return new Component(name,type,content,answer,null,x,y,id);
}

function fileComponentToField(component){
	var widthHeightFilename = component.content.split('&&');
	var generalFileUrl = top.location.href.replace('index.html','') + 'filestore/';
	
	var outer = document.createElement('div');
	var p1 = document.createElement('p');
	var p2 = document.createElement('p');
	var p3 = document.createElement('p');
	var p4 = document.createElement('p');
	var input = document.createElement('input');
	input.setAttribute('type','file');
	input.setAttribute('accept','image/*');
	input.className = 'imageInput';
	input.setAttribute('onChange','loadFile(event)');
	input.setAttribute('recorded_name', widthHeightFilename[2]);
	var output = document.createElement('img');
	output.setAttribute('name', widthHeightFilename[2]);
	output.setAttribute('width',widthHeightFilename[0]);
	output.setAttribute('height',widthHeightFilename[1]);
	output.src = generalFileUrl + widthHeightFilename[2];
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
	heightInput.value = widthHeightFilename[1];
	widthInput.value = widthHeightFilename[0];
	addQuestionField(outer, 'file',  undefined, undefined, false, component);
}
function fileFieldToComponent(card){
	var cardInputs = card.getElementsByTagName('input');
	var name = getFieldName(card);
	var filename = /*card.getElementsByTagName('img')[0].getAttribute('name');*/cardInputs[0].getAttribute('recorded_name');
	var type = 'file';
	var content = cardInputs[1].value + '&&' + cardInputs[2].value + '&&' + filename; //width then height then filename
	var answer = null;
	var weight = null;
	var x = card.style.left;
	var y = card.style.top;
	var id = card.getAttribute('id');
	return new Component(name,type,content,answer,null,x,y,id);
}

function textEntryComponentToField(component){
	var inner = document.createElement('div');
	var question = document.createElement('p');
	question.innerText = 'Q:';
	var answer = document.createElement('p');
	answer.innerText = 'A:';
	var qinput = document.createElement('input');
	qinput.setAttribute('type','text');
	qinput.style.width = '100%';
	qinput.value = component.content;
	var ainput = document.createElement('input');
	ainput.setAttribute('type','text');
	ainput.style.width = '100%';
	ainput.value = component.answer;
	question.appendChild(qinput);
	answer.appendChild(ainput);
	inner.appendChild(question);
	inner.appendChild(answer);
	addQuestionField(inner,'textEntry',undefined,undefined,false,component);
}
function textEntryFieldToComponent(card){
	var name = getFieldName(card);
	var type = 'textEntry';
	var content = card.getElementsByTagName('input')[0].value;
	var answer = card.getElementsByTagName('input')[1].value;
	var weight = null;
	var x = card.style.left;
	var y = card.style.top;
	var id = card.getAttribute('id');
	return new Component(name,type,content,answer,null,x,y,id);
}

function multipleChoiceComponentToField(component){
	var contentSections = component.content.split(';;');
	var question = contentSections.shift();
	var options = contentSections;
	var answerIndexes;
	if(component.answer){
		answerIndexes = component.answer.split(',');
	}
	
	var div = document.createElement('div');
	var questionDiv = document.createElement('div');
	questionDiv.className = 'multipleChoiceQuestion';
	questionDiv.innerText = question;
	var seperator = document.createElement('p');
	div.appendChild(questionDiv);
	div.appendChild(seperator);
	
	var listGroup = document.createElement('ul');
	listGroup.className = 'list-group';
	for(var i=0;i<options.length;i++){
		var listOption = document.createElement('li');
		listOption.className = 'list-group-item';
		if(answerIndexes && answerIndexes.indexOf(i.toString()) > -1){
			listOption.className += ' active';
		}
		listOption.innerText = options[i];
		listOption.setAttribute('onclick','multipleChoiceOptionToggleActive(this)');
		listGroup.appendChild(listOption);
	}
	div.appendChild(listGroup);
	addQuestionField(div,'multipleChoice',undefined,undefined,true,component);
}
function multipleChoiceFieldToComponent(card){
	var name = getFieldName(card);
	var question = card.getElementsByClassName('multipleChoiceQuestion')[0].innerText;
	var optionElements = card.getElementsByTagName('li');
	var content = question;
	var answers = '';
	for(var i=0;i<optionElements.length;i++){
		var optionElement = optionElements[i];
		content += ';;' + optionElement.innerText;
		if(optionElement.classList.contains('active')){
			if(answers){
				answers += ',' + i;
			}else{
				answers += i;
			}
		}
	}
	return new Component(name,'multipleChoice',content,answers,null,card.style.left,card.style.top,card.getAttribute('id'));
}
function lineGraphFieldToComponent(card){
	var name = getFieldName(card);
	var dataTable = card.getElementsByTagName('table')[0];
	var textFields = card.getElementsByTagName('text');
	var xaxis = dataTable.rows[0].cells[1].innerText;
	var yaxis = textFields[textFields.length-1].textContent;
	var content = xaxis + ';;' + yaxis;
	var answers = '';
	for(var i=1;i<dataTable.rows.length;i++){
		var x = dataTable.rows[i].cells[0].innerText
		var y = dataTable.rows[i].cells[1].innerText;
		content += ';;' + x + ';;' + y;
	}
	return new Component(name,'lineGraph',content,answers,null,card.style.left,card.style.top,card.getAttribute('id'));
}
function lineGraphComponentToField(component){
	var contentSections = component.content.split(';;');
	var xaxis = contentSections.shift();
	var yaxis = contentSections.shift();
	var x = [];
	var y = [];
	for(var i=0;i<contentSections.length;i=i+2){
		x.push(parseFloat(contentSections[i]));
		y.push(parseFloat(contentSections[i+1]));
	}
	var graph = generateLineGraphField(xaxis,yaxis,x,y);
	addQuestionField(graph,'lineGraph','600px',false,true,component);
}
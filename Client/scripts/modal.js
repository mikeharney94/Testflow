var modalsToNotClear = new Set();

//adds option to multiple choice modal dialog
function addMultipleChoiceOption(){
	var multipleChoiceOptionArea = document.getElementById('multipleChoiceOptionArea');
	
	var newRow = document.createElement('p');
	newRow.innerHTML = "<input type=\"text\" class=\"multipleChoiceOption\"></input>"
		+"<button type=\"button\" class=\"close\" aria-label=\"Close\" onclick=\"deleteOption(this,'multipleChoiceOptionArea')\">"
		+"<span aria-hidden=\"true\">&times;</span>";
		+"</button>";
	multipleChoiceOptionArea.insertBefore(newRow, document.getElementById('addMultipleChoiceOptionBtn'));
}

//removes option from multiple choice modal dialog
function deleteOption(deleteButton,optionAreaId){
	document.getElementById(optionAreaId).removeChild(deleteButton.parentElement);
}

function addLineGraphCoordinateData(){
	var lineGraphModalCoordinateArea = document.getElementById('lineGraphModalCoordinateArea');
	
	var newRow = document.createElement('p');
	newRow.className = 'coordinateRow';
	newRow.innerHTML = "<input type=\"text\" class=\"coordinateSet\" maxlength=\"6\" size=\"6\">"
		+"</input><input type=\"text\" class=\"coordinateSet\" maxlength=\"6\" size=\"6\"></input>"
		+"<button type=\"button\" class=\"close\" aria-label=\"Close\" onclick=\"deleteOption(this,'lineGraphModalCoordinateArea')\">"
		+"<span aria-hidden=\"true\">&times;</span>";
		+"</button>";
	lineGraphModalCoordinateArea.insertBefore(newRow, document.getElementById('addLineGraphCoordinateDataBtn'));
}

function validateLineGraphCoordinateModalInputs(){
	var coordinateArea = document.getElementById('lineGraphModalCoordinateArea');
	var coordInputs = coordinateArea.getElementsByTagName('input');
	for(var i=0;i<coordInputs.length;i++){
		var val = coordInputs[i].value;
		if(!(parseFloat(val) > -1)){
			if(val == ''){
				val = 'A non-entry';
			}
			alert(val + ' is not a valid numeric input. If you re-open the modal, your values will still be present.');
			modalsToNotClear.add('lineGraphModal');
			return false;
		}
	}
	return true;
}
//interprets modal data into a new field on the form (retains id)
function addFieldFromModal(type){
	var component;
	var modal =  document.getElementById(type + 'Modal');
	switch(type){
		case 'multipleChoice':
			component = multipleChoiceModalToComponent();
			Component.componentToField(component);
			break;
		case 'lineGraph':
			if(validateLineGraphCoordinateModalInputs()){
				modalsToNotClear.delete('lineGraphModal');
				component = lineGraphModalToComponent();
				Component.componentToField(component);
			}
			break;
	}
	modalOperatingId = '';
}
function lineGraphModalToComponent(){
	var modal =  document.getElementById('lineGraphModal');
	var xaxis = document.getElementById('LineGraphXaxis').value;
	var yaxis = document.getElementById('LineGraphYaxis').value;
	var coordinateArea = document.getElementById('lineGraphModalCoordinateArea');
	var coordInputs = coordinateArea.getElementsByTagName('input');
	//var x = [];
	//var y = [];
	var on_x = true;
	
	var name, answer, weight, fieldX, fieldY, id;
	var type = 'lineGraph';
	var content = xaxis + ';;' + yaxis;
	if(modal.component){
		name = modal.component.name;		
		answer = modal.component.answer;
		weight = modal.component.weight;
		fieldX = modal.component.x;
		fieldY = modal.component.y;
		id = modal.component.id;
	}
	for(var i=0;i<coordInputs.length;i++){
		content += ';;' + coordInputs[i].value;
	}
	return new Component(name,type,content,answer,weight,fieldX,fieldY,id);
}
function multipleChoiceModalToComponent(){
	var modal =  document.getElementById('multipleChoiceModal');
	var inputs = modal.getElementsByTagName('input');
	var question = inputs[0].value;
	
	var name, answer, weight, x, y, id;
	var type = 'multipleChoice';
	var content = question;
	if(modal.component){
		name = modal.component.name;		
		answer = modal.component.answer;
		weight = modal.component.weight;
		x = modal.component.x;
		y = modal.component.y;
		id = modal.component.id;
	}
	
	var inputs = modal.getElementsByTagName('input');
	for(var i=1;i<inputs.length;i++){
		content += ';;' + inputs[i].value;
	}
	return new Component(name,type,content,answer,weight,x,y,id);
}
function componentToMultipleChoiceModal(component){
	var modal = document.getElementById('multipleChoiceModal');
	modal.component = component;
	var contentArray = component.content.split(';;');

	//main question
	document.getElementById('multipleChoiceModalPrompt').value = contentArray.shift();			
	//options
	for(var i=0;i<contentArray.length;i++){
		addMultipleChoiceOption();
	}
	optionModalElements = modal.getElementsByClassName('multipleChoiceOption');
	for(var i=0;i<contentArray.length;i++){
		optionModalElements[i].value = contentArray[i];
	}
}
function componentToLineGraphModal(component){
	var modal = document.getElementById('lineGraphModal');
	modal.component = component;
	var contentArray = component.content.split(';;');
	var xaxis = contentArray.shift();
	var yaxis = contentArray.shift();
	document.getElementById('LineGraphXaxis').value = xaxis;
	document.getElementById('LineGraphYaxis').value = yaxis;
	var newRowCount = contentArray.length/2;
	for(var i=0;i<newRowCount;i++){
		addLineGraphCoordinateData();
	}
	coordinateInputs = modal.getElementsByClassName('coordinateSet');
	for(var i=0;i<coordinateInputs.length;i++){
		coordinateInputs[i].value = contentArray[i];
	}
}
function clearModal(modalId){
	var modal = document.getElementById(modalId);
	if(modalsToNotClear.has(modalId)){
		return;
	}
	modal.component = undefined;
	switch(modalId){
		case 'multipleChoiceModal':
			var optionArea = document.getElementById('multipleChoiceOptionArea');
			var options = optionArea.getElementsByTagName('p');
			while(options.length > 0){
				options[0].parentElement.removeChild(options[0]);
			}
			var inputs = modal.getElementsByTagName('input');
			for(var i=0;i<inputs.length;i++){
				inputs[i].value='';
			}
			break;
		case 'lineGraphModal':
			var coordArea = document.getElementById('lineGraphModalCoordinateArea');
			var coords = coordArea.getElementsByClassName('coordinateRow');
			while(coords.length > 0){
				coords[0].parentElement.removeChild(coords[0]);
			}
			var inputs = modal.getElementsByTagName('input');
			for(var i=0;i<inputs.length;i++){
				inputs[i].value='';
			}
			break;
	}
}
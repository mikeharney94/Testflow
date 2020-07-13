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
function getAllFieldComponents(getNewFields){
	var fields = document.getElementsByClassName('card');
	var components = [];
	for(var i=0;i<fields.length;i++){
		var component_i = fieldToComponent(fields[i]);
		if(component_i && getNewFields == !component_i.id){
			components.push(component_i);
		}
	}
	return components;
}
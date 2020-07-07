function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild; 
}

function setBootstrapButtonText(selectionButton, text){
	selectionButton.parentElement.parentElement.firstElementChild.innerText = text;
}
function setBootstrapButtonId(selectionButton, id){
	selectionButton.parentElement.parentElement.firstElementChild.id = id;
}
function setBootstrapButtonTextAndIdBySelect(selectionButton, text, id){
	setBootstrapButtonText(selectionButton, text);
	setBootstrapButtonId(selectionButton, id);
}

function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
	});
	return vars;
}

function callModalMethod(modalName, el) {
	window.parent.returnModalResult(frameElement.id, el);
}

function closeModalById(modalId){
	$('#' + modalId).modal('toggle');
}

function isNumber(val){
	return !!parseFloat(val);
}
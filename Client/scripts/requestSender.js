function sendRequest(jsonData, successFunction, failureFunction){
		jsonData.username = top.testflow.user.username,
		jsonData.password = top.testflow.user.password,
		$.ajax({
			url: top.testflow.requestUrl,
			type:"POST",
			dataType:"json",
			contentType: "application/json",
			data: JSON.stringify(jsonData),
			success: function(data, textStatus, jqXHR){
				successFunction(data, textStatus, jqXHR);
			},
			error: function(jqXHR, textStatus, errorThrown){
				try{
					top.throwError(JSON.parse(jqXHR.responseText).message || errorThrown);
				}catch{
					top.throwError("Error string:" + errorThrown);
				}
			}
		});
	}
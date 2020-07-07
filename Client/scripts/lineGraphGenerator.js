function generateLineGraphField(xaxis,yaxis,x,y){
	var chart = document.createElement('div');
	google.charts.load('current', {packages: ['corechart', 'line']});
	google.charts.setOnLoadCallback(function(){ createLineGraph(xaxis,yaxis,x,y,chart); });
	return chart;
}
function createLineGraph(xaxis,yaxis,x,y,el) {
      var data = new google.visualization.DataTable();
      data.addColumn('number', 'X');
      data.addColumn('number', xaxis);

	  var rows = [];
	  for(var i=0;i<x.length;i++){
		  var coord = [x[i],y[i]];
		  rows.push(coord);
	  }
	  rows.sort(function(a, b) {
		var xvalA = a[0],
			xvalB = b[0],
			yvalA = a[1];
			yvalB = b[1];
		if (xvalA < xvalB) {
			return 1;
		}
		if (xvalA > xvalB) {
			return -1;
		}
		if (yvalA < yvalB) {
			return 1;
		}
		if (yvalA > yvalB) {
			return -1;
		}
		return 0;
	});
      data.addRows(rows);

      var options = {
        hAxis: {
          title: xaxis
        },
        vAxis: {
          title: yaxis
        },
        backgroundColor: '#f1f8e9',
		'width': 600
      };

      var chart = new google.visualization.LineChart(el);
      chart.draw(data, options);
	  return el;
}
import {GoogleCharts} from 'google-charts';

//Google Chart
GoogleCharts.load('current', {packages: ['corechart']});

//TODO : this is for stop only
function drawDistColumn(data){

  let dataArray = new Array();
  dataArray.push(['Date', 'Early', 'On-time', 'Late', 'Very Late']);  //push title
  for(let i in data){
    dataArray.push(data[i]);
  }

  let dataTable = GoogleCharts.api.visualization.arrayToDataTable(dataArray);

  const options ={
    colors: ['blue', 'green', 'yellow', 'red']
  };

  const columnChart = new GoogleCharts.api.visualization.ColumnChart($('div#overview_columnchart')[0]);
  columnChart.draw(dataTable, options);
}

function drawBoxPlot(data){
  var array = [
    ['a', 100, 90, 110, 85, 96, 104, 120],
    ['b', 120, 95, 130, 90, 113, 124, 140],
    ['c', 130, 105, 140, 100, 117, 133, 139],
  ];

  var dataTable = new GoogleCharts.api.visualization.DataTable();
  dataTable.addColumn('string', 'x');
  dataTable.addColumn('number', 'series0');
  dataTable.addColumn('number', 'series1');
  dataTable.addColumn('number', 'Max');
  dataTable.addColumn('number', 'Min');
  dataTable.addColumn('number', 'First Quartile');
  dataTable.addColumn('number', 'Median');
  dataTable.addColumn('number', 'Third Quartile');
  dataTable.addColumn({id:'max', type:'number', role:'interval'});
  dataTable.addColumn({id:'min', type:'number', role:'interval'});
  dataTable.addColumn({id:'firstQuartile', type:'number', role:'interval'});
  dataTable.addColumn({id:'median', type:'number', role:'interval'});
  dataTable.addColumn({id:'thirdQuartile', type:'number', role:'interval'});

  dataTable.addRows(getBoxPlotValues(array));

  /**
   * Takes an array of input data and returns an
   * array of the input data with the box plot
   * interval data appended to each row.
   */
  function getBoxPlotValues(array) {
    for (var i = 0; i < array.length; i++) {

      var arr = array[i].slice(1).sort(function (a, b) {
        return a - b;
      });

      var max = arr[arr.length - 1];
      var min = arr[0];
      var median = getMedian(arr);

      // First Quartile is the median from lowest to overall median.
      var firstQuartile = getMedian(arr.slice(0, 4));

      // Third Quartile is the median from the overall median to the highest.
      var thirdQuartile = getMedian(arr.slice(3));

      array[i][8] = max;
      array[i][9] = min
      array[i][10] = firstQuartile;
      array[i][11] = median;
      array[i][12] = thirdQuartile;
    }
    return array;
  }

  function getMedian(array) {
    var length = array.length;
    if (length % 2 === 0) {
      var midUpper = length / 2;
      var midLower = midUpper - 1;

      return (array[midUpper] + array[midLower]) / 2;
    } else {
      return array[Math.floor(length / 2)];
    }
  }

  var options = {
    title:'Box Plot',
    height: 500,
    legend: {position: 'none'},
    hAxis: {
      gridlines: {color: '#fff'}
    },
    lineWidth: 0,
    series: [{'color': '#D3362D'}],
    intervals: {
      barWidth: 1,
      boxWidth: 1,
      lineWidth: 2,
      style: 'boxes'
    },
    interval: {
      max: {
        style: 'bars',
        fillOpacity: 1,
        color: '#777'
      },
      min: {
        style: 'bars',
        fillOpacity: 1,
        color: '#777'
      }
    }
  };

  var chart = new GoogleCharts.api.visualization.LineChart(document.getElementById('overview_boxchart'));

  chart.draw(dataTable, options);
}

$(function() {
  $('#stop-dist-button').click(function(event){
    getStopDist(event);
  });

  $('#box-button').click(function(event){
    getStopBox(event);
  });
});


function getStopDist(event){
  event.preventDefault();
  $.get('/getStopDist', results=>{
  //  const FAKE_DATA = [['20181002', 26, 699, 33 ,12 ], ['20181003', 26, 232, 58 ,60 ]]
    let data = results;
    drawDistColumn(data)
  });
}

function getStopBox(event){
  event.preventDefault();
  let data;
  drawBoxPlot(data);
}

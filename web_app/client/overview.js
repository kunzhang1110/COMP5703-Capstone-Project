import {GoogleCharts} from 'google-charts';

//Plotly graph embeded html
const STOP_HTML = '<iframe id="igraph" scrolling="no" style="border:none;" seamless="seamless" src="https://plot.ly/~XuyingWang/34.embed" height="525px" width="100%"></iframe>';
const TRIP_HTML = '<iframe id="igraph" scrolling="no" style="border:none;" seamless="seamless" src="https://plot.ly/~XuyingWang/36.embed" height="525px" width="100%"></iframe>';
const ROUTE_HTML = '<iframe id="igraph" scrolling="no" style="border:none;" seamless="seamless" src="https://plot.ly/~XuyingWang/38.embed" height="525px" width="100%"></iframe>';

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
    colors: ['blue', 'green', 'yellow', 'red'],
    hAxis: {
      title: 'Date'
    },
    vAxis: {
      title: 'Count'
    },
  };

  const columnChart = new GoogleCharts.api.visualization.ColumnChart($('div#overview_columnchart')[0]);
  columnChart.draw(dataTable, options);
}



$(function() {

  $('#overview-dist-select').change(function(event){
    let position = $(this).val();

    switch(position){
    case '1':
      getStopDist(event);
      break;
    case '2':
      getTripDist(event);
      break;
    case '3':
      getRouteDist(event);
      break;
    default:
      getStopDist(event);
    }
  });

  $('#overview-trend-select').change(function(event){
    let position = $(this).val();

    switch(position){
    case '1':
      $('#trend-graph').html(STOP_HTML);
      break;
    case '2':
      $('#trend-graph').html(TRIP_HTML);
      break;
    case '3':
      $('#trend-graph').html(ROUTE_HTML);
      break;
    default:
      getStopDist(event);
    }
  });
});


function getStopDist(event){
  event.preventDefault();
  $.get('/getStopDist', results=>{
    let data = results;
    drawDistColumn(data);
  });
}

function getTripDist(event){
  event.preventDefault();
  $.get('/getTripDist', results=>{
    let data = results;
    drawDistColumn(data);
  });
}

function getRouteDist(event){
  event.preventDefault();
  $.get('/getRouteDist', results=>{
    let data = results;
    drawDistColumn(data);
  });
}

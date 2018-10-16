import {GoogleCharts} from 'google-charts';

//Google Chart
GoogleCharts.load(drawPieChart);

function drawPieChart() {

  // Standard google charts functionality is available as GoogleCharts.api after load
  const data = GoogleCharts.api.visualization.arrayToDataTable([
    ['Chart Label', 'Chart amount'],
    ['Early', convertToFloat('#early_percentage span')],
    ['On-time', convertToFloat('#ontime_percentage span')],
    ['Late', convertToFloat('#late_percentage span')],

  ]);

  const options = {
    title: 'Distribution of Delay',
    is3D: true,
    slices: {
      1: {offset: 0.5, color: 'green', textStyle:{fontSize:25}},
      2: {color: 'red'}
    }
  };

  const piechart = new GoogleCharts.api.visualization.PieChart($('div#route_piechart')[0]);
  piechart.draw(data, options);
}


$(function() {

  $('#nav-bar-button').click(function(event){
    getRoute(event, '#nav-bar-input');
  });

  $('#search-bar-button').click(function(event){
    getRoute(event, '#search-bar-input');
  });

  // Toggle the side navigation
  $('#sidebarToggle').on('click',function(e) {
    e.preventDefault();
    $('body').toggleClass('sidebar-toggled');
    $('.sidebar').toggleClass('toggled');
  });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function(e) {
    if ($(window).width() > 768) {
      var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
      this.scrollTop += (delta < 0 ? 1 : -1) * 30;
      e.preventDefault();
    }
  });



});

/* Auxilary function
*/
function getRoute(event,textString){
  event.preventDefault();
  let route_short_name = $(textString)[0].value;
  $.get('/getRoute', {'route_short_name':route_short_name}, ()=>{
    window.location.href='/getRoute?route_short_name=' + route_short_name;
  });
}

function convertToFloat(selector){
  return parseFloat($(selector).text().slice(0,5));
}

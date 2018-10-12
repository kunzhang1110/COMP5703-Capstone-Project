


$(function() {

  $('#nav-bar-button').click(function(event){
    getRoute(event, '#nav-bar-input');
  });

  $('#search-bar-button').click(function(event){
    getRoute(event, '#search-bar-input');
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

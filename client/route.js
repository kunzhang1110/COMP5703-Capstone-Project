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
  window.location.href='/getRoute?route_short_name=' + route_short_name;
}


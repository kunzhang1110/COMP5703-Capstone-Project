var positions;
var initMap = function() {
  // The location of Uluru
  var usyd = {lat: -33.888584, lng: 151.1873473};
  // The map, centered at Uluru
  var map = new window.google.maps.Map(
    document.getElementById('map'), {zoom: 13, center: usyd});
  // The marker, positioned at Uluru
  $.get('getPosition',data => {
    positions = data;
    console.log(positions);
    for (let id in positions){
      var latLng = new window.google.maps.LatLng(positions[id].latitude,positions[id].longitude);
      var marker = new window.google.maps.Marker({
        position: latLng,
        map: map
      });
    }
  });
};

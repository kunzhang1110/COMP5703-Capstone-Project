import {GoogleCharts} from 'google-charts';

//Google Chart
GoogleCharts.load(drawPieChart);
showMap();
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

  // Toggle the side navigation
  $('#sidebarToggle').on('click',function(e) {
    e.preventDefault();
    $('body').toggleClass('sidebar-toggled');
    $('.sidebar').toggleClass('toggled');
  });

//  $('#mapInfo').load(function(event){
//	  showMap(event);
//    });

  $("#routeDirectionButton").click(function(){
		var direction = $("#routeDirectionButton").val();
		direction = (direction==0) ? 1 : 0;
		$("#routeDirectionButton").val(direction);
		showMap();
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

function convertToFloat(selector){
  return parseFloat($(selector).text().slice(0,5));
}

function showMap(){
	var route = $("#route").text();
    var direction = $("#routeDirectionButton").val();
    $.get('/routemap', {'route':route, 'direction':direction}, results=>{
    	 mapHandler(results);
    });
}

function mapHandler(results){
	$("#map").html("");
    $("#stopNames").html("");
    if(results.length == 0){
        return;
    }else{
        initMap(results);
    }
}

function initMap(response){
    // Create a map and center it
    var map;
    var centerlat = (response[response.length-1].lat + response[0].lat) / 2;
    var centerlon = (response[response.length-1].lon + response[0].lon) / 2;
    var centerlatLon = new google.maps.LatLng(centerlat, centerlon);
    map = new google.maps.Map(document.getElementById('map'), {zoom: 13, center: centerlatLon});
    // set circle marker properties
    var circleIcon = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#00BFFF",
            fillOpacity: 1,
            scale: 8,
            strokeColor: '#FFFFFF',
            strokeWeight: 4
    };
    response.forEach(function (data, index){
        var marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(data.lat, data.lon),
            icon: circleIcon
        })
    });
    divideBatch(response, map);
}

function divideBatch(response, map){
    var batches = [];
    var itemsPerBatch = 23;
    var itemsCount = 0;
    while(itemsCount < response.length-1){
        var subBatch = [];
        var subItemsCount = 0;
        for(var i = itemsCount; i < response.length; i++){
            subItemsCount++;
            subBatch.push({
                location: new google.maps.LatLng(response[i].lat, response[i].lon),
                stopover: true
            });
            if(subItemsCount == itemsPerBatch){
                break;
            }
        }
        itemsCount += subItemsCount;
        batches.push(subBatch);
        itemsCount--;
    }
    drawRoute(response, map, batches);
}

function drawRoute(response, map, batches){
    for(var k = 0; k < batches.length; k++){
        (function(kk){
            var directionsService = new google.maps.DirectionsService();
            var directionsDisplay = new google.maps.DirectionsRenderer({
                map: map,
                preserveViewport: true,
                suppressMarkers: true,
                suppressPolylines: false,
                polylineOptions: {strokeColor: "#00BFFF", strokeOpacity: 1, strokeWeight: 5}
            });
            var waypts = batches[k];
            var start = waypts[0].location;
            var end = waypts[waypts.length-1].location;
            // splice start and end stops
            waypts.splice(0, 1);
            waypts.splice(waypts.length-1, 1);
            var request = {
                origin: start,
                destination: end,
                waypoints: waypts,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function(result, status){
                if(status == window.google.maps.DirectionsStatus.OK){
                    directionsDisplay.setDirections(result);
                }
            });
         })(k);
    }
    stopShowHandler(response);
}

function stopShowHandler(response){
    // create stop labels
    response.forEach(function (data, index){
        $("#stopNames").append('<div class="stopName" id="' + data.stopId + '">' + data.name + '</div>');
        stopClicker(data.stopId);
    });
}

function stopClicker(id){
    $("#"+id).on("click", function (){
        var stopId = $(this).attr('id');
        stopsSearchHandler(stopId);
    });
}

var stopsSearchHandler = function(stopId){
    $.ajax({
        async: false,
        url: '/stop?stopId=' + stopId,
        method:'GET',
        success: function (response){
            $(".stopDelay").remove();
            if(response.length == 0){
                return;
            }else{
                // show stop delay information
                response.forEach(function (data, index){
                    var percent = data.p * 100;
                    var percentage = percent.toFixed(2) + "%";
                    if(new String(data.type) == "early"){
                        $('<div class="stopDelay"> Early: ' + percentage + '</div>').insertAfter("#"+stopId);
                    }else if(new String(data.type) == "on time"){
                        $('<div class="stopDelay"> On Time: ' + percentage + '</div>').insertAfter("#"+stopId);
                    }else{
                        $('<div class="stopDelay"> Late: ' + percentage + '</div>').insertAfter("#"+stopId);
                    }
                })
            }
        }
    })
}

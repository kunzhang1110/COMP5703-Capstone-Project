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
      1: {offset: 0.2, color: 'green', textStyle:{fontSize:25}},
      2: {color: 'red'}
    }
  };

  const piechart = new GoogleCharts.api.visualization.PieChart($('div#route_piechart')[0]);
  piechart.draw(data, options);
}


$(function() {
  if($('#route').text() == '891'|| $('#route').text() == 'X04'||
$('#route').text() == '725e'|| $('#route').text() == '699w'){//891, X04 are one-way services
    $('#routeDirectionButton').attr('disabled', true);
  }else{
    $('#routeDirectionButton').attr('disabled', false);
  }


  $("#routeDirectionButton").mouseenter(function(){
        $("#routeDirectionButton").css("background-color", "#7cb7e8");
        $("#routeDirectionButton").css("color", "#f8f9fa");
  });

  $("#routeDirectionButton").mouseleave(function(){
        $("#routeDirectionButton").css("background-color", "#f8f9fa");
        $("#routeDirectionButton").css("color", "#7cb7e8");
  });

  $('#routeDirectionButton').click(function(){
    var direction = $('#routeDirectionButton').val();
    direction = (direction==0) ? 1 : 0;
    $('#routeDirectionButton').val(direction);
    $('#stopDelay').html("");
    $('#stopDelay').append('<img src="/stop.jpg" alt="Stop" style="height: 33%; margin-left: -12%; margin-top: 15%; margin-bottom: 15%" />');
    showMap();
  });
});

/* Auxilary function
*/
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
    $("#stops").html("");
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
            fillColor: "#7cb7e8",
            fillOpacity: 1,
            scale: 8,
            strokeColor: '#FFFFFF',
            strokeWeight: 4
    };

    var markers = [];
    response.forEach(function (data) {
        var marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(data.lat, data.lon),
            icon: circleIcon
        });
        markers.push(marker);
    });

    divideBatch(response, map, markers);
}

function divideBatch(response, map, markers){
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
    drawRoute(response, map, batches, markers);
}

function drawRoute(response, map, batches, markers){
    for(var k = 0; k < batches.length; k++){
        (function(kk){
            var directionsService = new google.maps.DirectionsService();
            var directionsDisplay = new google.maps.DirectionsRenderer({
                map: map,
                preserveViewport: true,
                suppressMarkers: true,
                suppressPolylines: false,
                polylineOptions: {strokeColor: "#7cb7e8", strokeOpacity: 1, strokeWeight: 5}
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
    stopShowHandler(response, markers);
}

function stopShowHandler(response, markers){
    //create stops information window
    var infowindow = new google.maps.InfoWindow();
    // create stop labels
    response.forEach(function (data){
        var detailId = "d" + data.stopId;
        var detailInfo = "t" + data.stopId;
        $("#stops").append('<div class=" pt-4 mt-2 text-center font-weight-bold align-middle rounded shadow" style="height: 15%; width: 95%; opacity: 0.7; background-color: #7cb7e8; color: #ffffff; font-size: 90%; cursor: pointer" id="' + data.stopId + '">' + data.name + '</div>');
        $("#stops").append('<div class=" pt-3 text-center font-weight-bold rounded shadow" style="height: 12%; width: 95%; opacity: 0.5; background-color: #7cb7e8; color: #ffffff; font-size: 90%;" id="' + detailId + '"><span  id="' + detailInfo + '" style="cursor: pointer">stop details</span></div>');
        $("#"+detailId).hide();
        stopClicker(data, markers, infowindow);
    });
}

function stopClicker(data, markers, infowindow){
    $("#"+data.stopId).on("click", function (){
        var detailId = "d" + data.stopId;
        var detailInfo = "t" + data.stopId;
        var marker = markers[data.sequence-1];
        infowindow.setContent('<div><h5>Stop ' + data.sequence + '</h5><p>' + data.name + '</p>' + '</div>');
        infowindow.open(map, marker);
        if ($('#'+detailId).is(":hidden")) {
            $('#'+detailId).show();
            $("#"+detailInfo).on("click", function (){
                stopsSearchHandler(data.stopId);
            });
        }else{
            $('#'+detailId).hide();
        }
    });
}

var stopsSearchHandler = function(stopId){
    $.ajax({
        async: false,
        url: '/stop?stopId=' + stopId,
        method:'GET',
        success: function (response){
            $("#stopDelay").html("");
            if(response.length == 0){
                return;
            }else{
                // show stop delay information
                var data = response[0];
                Highcharts.chart('stopDelay', {
                    chart: {
                        backgroundColor: '#f8f9fa',
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false
                    },
                    title: {
                        text: "On-time performance: <br />" + data.name,
                        x: 0
                    },
                    tooltip: {
                        headerFormat: '',
                        pointFormat: '{point.name}: <b>{point.percentage:.2f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.2f}%',
                                style: {
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                }
                            },
                            point: {
                                events: {
                                    mouseOver: function () {
                                        this.slice();
                                    },
                                    mouseOut: function () {
                                        this.slice();
                                    }
                                }
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        colorByPoint: true,
                        data: [{
                            name: 'On-time',
                            y: data.ontime
                        }, {
                            name: 'Early',
                            y: data.early
                        }, {
                            name: 'Late',
                            y: (data.late + data.verylate)
                        }]
                    }],
                    credits: {
                        enabled: false
                    }
                });

            }
        }
    })
}

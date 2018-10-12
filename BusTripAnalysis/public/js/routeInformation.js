$(function(){
	var mapHandler = function(route, direction){
        $.ajax({
        	url: '/routemap?route=' + route +'&direction=' + direction,
            method:'GET',
            success: function (response){
            	$("#map").html("");
            	$("#stopNames").html("");
                if(response.length == 0){
                	return;
                }else{
                	function initMap(){
                		var directionsService = new google.maps.DirectionsService();
                		var directionsDisplay = new google.maps.DirectionsRenderer({
                			suppressMarkers: true, 
                			suppressPolylines: false,
                			polylineOptions: {strokeColor: "#00BFFF", strokeOpacity: 1, strokeWeight: 5}
                		});
                		// Create a map and center it
                		var map;
                		var centerlat = (response[response.length-1].lat + response[0].lat) / 2;
                		var centerlon = (response[response.length-1].lon + response[0].lon) / 2;
                		var centerlatLon = new google.maps.LatLng(centerlat, centerlon);
                		map = new google.maps.Map(document.getElementById('map'), {zoom: 13, center: centerlatLon});
                		directionsDisplay.setMap(map);
                        // set circle marker propertires
                		var circleIcon = {
                			    path: google.maps.SymbolPath.CIRCLE,
                			    fillColor: "#00BFFF",
                			    fillOpacity: 1,
                			    scale: 8,
                			    strokeColor: '#FFFFFF',
                			    strokeWeight: 4
                		};
                		// create markers and stop labels
                		response.forEach(function (data, index){
                			new google.maps.Marker({
                    			map: map,
                    			position: new google.maps.LatLng(data.lat, data.lon),
                    			icon: circleIcon
                    		})
                			$("#stopNames").append('<div class="stopName" id="' + data.stopId + '">' + data.name + '</div>');
                			stopListener(data.stopId);
                		});
                		
                		calcRoute(directionsService, directionsDisplay);
					}

                	function stopListener(id){
                		$("#"+id).on("click", function (){
            				var stopId = $(this).attr('id');
            				stopsHandler(stopId);
            			});
                	}
                    // calculate route legs 
                	function calcRoute(directionsService, directionsDisplay){
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
            		    var combinedResults;
            		    var originalResults = [{}];
            		    var resultsCount = 0;
            		    for(var k = 0; k < batches.length; k++){
            		        var waypts = batches[k];
            		        start = waypts[0].location;
            		        end = waypts[waypts.length-1].location;
            		        // splice start and end stops
            		        waypts.splice(0, 1);
            		        waypts.splice(waypts.length-1, 1);
            		        var request = {
            		        	origin: start,
            		            destination: end,
            		            waypoints: waypts,
            		            travelMode: google.maps.TravelMode.DRIVING
            		        };
                            // combine route legs
            		        (function(kk){
            		        	directionsService.route(request, function(result, status){
            		        		if(status == window.google.maps.DirectionsStatus.OK){
            		        			var originalResult = {result: result};
            		        			originalResults.push(originalResult);
            		        			resultsCount++;
            		        			if(resultsCount == batches.length){
            		        				var count = 0;
            		        				for(var key in originalResults){
            		        					if(originalResults[key].result != null){
            		        	                    if (count == 0){
            		        	                    	combinedResults = originalResults[key].result;
            		        	                    }else{
            		        	                    	combinedResults.routes[0].legs = combinedResults.routes[0].legs.concat(originalResults[key].result.routes[0].legs);
            		        	                    }
            		        	                    count++;
            		        	                 }
            		        				}
            		        			}
            		        			directionsDisplay.setDirections(combinedResults); 
            		        		}
            		            });
            		         })(k);
            		    }
            		}
                	initMap();
                }
            }
        })
    }

	var stopsHandler = function(stopId){
        $.ajax({
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
	// init data
	var init = function(){
		$("#routeSearchButton").on("click", function (){
			var route = $("#route").val();
			var direction = $("#routeDirectionButton").val();
			if(route.trim()==""){
				$("#routeResult").hide();
				return;
			}else{
				$("#routeResult").show();
				$("#routeName").text("BUS " + route);
				mapHandler(route, direction);
			}
		});
		
		$("#routeDirectionButton").on("click", function (){
			var direction = $("#routeDirectionButton").val();
			direction = (direction==0) ? 1 : 0;
			$("#routeDirectionButton").val(direction);
			var route = $("#route").val();
			mapHandler(route, direction);
		});
	}
	init();
});

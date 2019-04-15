import * as model from '../models/model';

function getPercentage(num){
  return (num).toFixed(2) + ' %';
}

export const displayRouteMainPage = function (req, res){
  res.render('route_main_page');
};

export const displayAboutPage = function (req, res){
  res.render('about_page');
};

export const displayPredictivePage = function (req, res){
  res.render('predictive_page');
};

export const getRoute = function (req, res){

  //Mock Data
  let result = {
    route_short_name: req.query.route_short_name,
    route_long_name: 'Central to Burwood',
    route_desc: 'Sydney Buses Network',
    agency_name: 'State Transit Sydney',
    route_performance: 'On-time',
    early_percentage_string: getPercentage(Math.random()*100),
    ontime_percentage_string: getPercentage(Math.random()*100),
    late_percentage_string: getPercentage(Math.random()*100),
  };
  res.render('route_page',{bus:result}); 


  // var route_short_name = req.query.route_short_name;
  // model.getRoute().then(results => {
  //   if (results!= null){
  //     let result = results.find( x => x.route_short_name === route_short_name);

  //     if (result.route_performance == 'route_early'){
  //       result.route_performance = 'Early';
  //     } else if(result.route_performance == 'route_ontime'){
  //       result.route_performance = 'On-time';
  //     } else{
  //       result.route_performance = 'Late';
  //     }

  //     console.info(result);
  //     result = {
  //       ...result,
  //       early_percentage_string: getPercentage(result.early_percentage),
  //       ontime_percentage_string: getPercentage(result.ontime_percentage),
  //       late_percentage_string: getPercentage(result.late_percentage),
  //     };
  //     res.render('route_page',{bus:result}); 
  //   }else{
  //     res.render('error_page');
  //   }
  // }).catch(e=>{
  //   console.error(e);
  //   res.render('error_page');
  // }
  // );
};

//
export const displayOverviewPage = function (req, res){
  res.render('overview_page');
};

export const getStopDist = function (req, res){

  //Mock Data
  var arrayAll= new Array();
  for(let i=0;i<15;i++){
    let start_date = new Date(2019, 10, i);
    let dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    let start_date_localeString = start_date.toLocaleString('en-US', dateOptions);
    let start_date_string = start_date_localeString.slice(5,11)+'\n' +start_date_localeString.slice(0,3);
    let array = [start_date_string, Math.random()*1000,
      Math.random()*1000+ 5000, Math.random()*1000, Math.random()*1000];
    arrayAll.push(array);
  }
  res.send(arrayAll);  //JSON format

  // model.getStopDist().then(results => {
  //   var arrayAll= new Array();
  //   results.forEach(function(result,index){
  //     let start_date = new Date(result.start_date);
  //     let dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  //     let start_date_localeString = start_date.toLocaleString('en-US', dateOptions);
  //     let start_date_string = start_date_localeString.slice(5,11)+'\n' +start_date_localeString.slice(0,3);
  //     let array = [start_date_string, result.early, result.on_time, result.late, result.Very_late];
  //     arrayAll.push(array);
  //   });
  //   res.send(arrayAll);  //JSON format
  // });
};

export const getTripDist = function (req, res){

    //Mock Data
    var arrayAll= new Array();
    for(let i=0;i<15;i++){
      let start_date = new Date(2019, 10, i);
      let dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      let start_date_localeString = start_date.toLocaleString('en-US', dateOptions);
      let start_date_string = start_date_localeString.slice(5,11)+'\n' +start_date_localeString.slice(0,3);
      let array = [start_date_string, Math.random()*1000,
        Math.random()*1000+ 5000, Math.random()*1000, Math.random()*1000];
      arrayAll.push(array);
    }
    res.send(arrayAll);  //JSON format

  // model.getTripDist().then(results => {
  //   var arrayAll= new Array();
  //   results.forEach(function(result,index){
  //     let start_date = new Date(result.start_date);
  //     let dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  //     let start_date_localeString = start_date.toLocaleString('en-US', dateOptions);
  //     let start_date_string = start_date_localeString.slice(5,11)+'\n' +start_date_localeString.slice(0,3);
  //     let array = [start_date_string, result.trip_early, result.trip_ontime, result.trip_late, 0];
  //     arrayAll.push(array);
  //   });

  //   res.send(arrayAll);  //JSON format
  // });
};

export const getRouteDist = function (req, res){
    //Mock Data
    var arrayAll= new Array();
    for(let i=0;i<15;i++){
      let start_date = new Date(2019, 10, i);
      let dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      let start_date_localeString = start_date.toLocaleString('en-US', dateOptions);
      let start_date_string = start_date_localeString.slice(5,11)+'\n' +start_date_localeString.slice(0,3);
      let array = [start_date_string, Math.random()*1000,
        Math.random()*1000+ 5000, Math.random()*1000, Math.random()*1000];
      arrayAll.push(array);
    }
    res.send(arrayAll);  //JSON format

  // model.getRouteDist().then(results => {
  //   var arrayAll= new Array();
  //   results.forEach(function(result,index){
  //     let start_date = new Date(result.start_date);
  //     let dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  //     let start_date_localeString = start_date.toLocaleString('en-US', dateOptions);
  //     let start_date_string = start_date_localeString.slice(5,11)+'\n' +start_date_localeString.slice(0,3);
  //     let array = [start_date_string, result.route_early, result.route_ontime, result.route_late, 0];

  //     // //remove the last day
  //     // if(index != (results.length-1)){
  //     //   arrayAll.push(array);
  //     // }

  //     //keep all days
  //     arrayAll.push(array);
  //   });

  //   res.send(arrayAll);  //JSON format
  // });
};

export const getRouteMap = function (req, res){
  let results = [
    {lat: 37.772, lng: -122.214},
    {lat: 21.291, lng: -157.821},
    {lat: -18.142, lng: 178.431},
    {lat: -27.467, lng: 153.027}
  ]
  res.send(results)
  // var route = req.query.route;
  // var direction = req.query.direction;
  // model.getRouteMap(route, direction).then(results => {
  //   // console.info(results);
  //   res.send(results);
  // }).catch(error => console.error(error));
};

export const getStop = function (req, res){
  var stopId = req.query.stopId;
  model.getStop(stopId).then(results => {
    // console.info(results);
    res.send(results);
  }).catch(error => console.error(error));
};

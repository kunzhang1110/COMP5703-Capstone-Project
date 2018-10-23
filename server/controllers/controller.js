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


export const getRoute = function (req, res){
  var route_short_name = req.query.route_short_name;
  model.getRoute().then( results => {
    let result = results.find( x => x.route_short_name === route_short_name);

    console.info(result);
    result = {
      ...result,
      early_percentage_string: getPercentage(result.early_percentage),
      ontime_percentage_string: getPercentage(result.ontime_percentage),
      late_percentage_string: getPercentage(result.late_percentage),
    };
    res.render('route_page',{bus:result}); //index.ejs
  });
};

//
export const displayOverviewPage = function (req, res){
  res.render('overview_page');
};

export const getStopDist = function (req, res){
  model.getStopDist().then(results => {
    console.log(results)
    const FAKE_DATA = [['20181002', 26, 699, 33 ,12 ], ['20181003', 26, 232, 58 ,60 ]]
    results = FAKE_DATA;
    res.send(results);
  });
};


export const getRouteMap = function (req, res){
	var route = req.query.route;
	var direction = req.query.direction;
  model.getRouteMap(route, direction).then(results => {
	  console.info(results)
      res.send(results);
  }).catch(error => console.error(error));
};

export const getStop = function (req, res){
	var stopId = req.query.stopId;
  model.getStop(stopId).then(results => {
	console.info(results);
    res.send(results);
  }).catch(error => console.error(error));
};

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStop = exports.getRouteMap = exports.getRouteDist = exports.getTripDist = exports.getStopDist = exports.displayOverviewPage = exports.getRoute = exports.displayPredictivePage = exports.displayAboutPage = exports.displayRouteMainPage = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _model = require('../models/model');

var model = _interopRequireWildcard(_model);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getPercentage(num) {
  return num.toFixed(2) + ' %';
}

var displayRouteMainPage = exports.displayRouteMainPage = function displayRouteMainPage(req, res) {
  res.render('route_main_page');
};

var displayAboutPage = exports.displayAboutPage = function displayAboutPage(req, res) {
  res.render('about_page');
};

var displayPredictivePage = exports.displayPredictivePage = function displayPredictivePage(req, res) {
  res.render('predictive_page');
};

var getRoute = exports.getRoute = function getRoute(req, res) {
  var route_short_name = req.query.route_short_name;
  model.getRoute().then(function (results) {
    var result = results.find(function (x) {
      return x.route_short_name === route_short_name;
    });

    console.info(result);
    result = _extends({}, result, {
      early_percentage_string: getPercentage(result.early_percentage),
      ontime_percentage_string: getPercentage(result.ontime_percentage),
      late_percentage_string: getPercentage(result.late_percentage)
    });
    res.render('route_page', { bus: result }); //index.ejs
  });
};

//
var displayOverviewPage = exports.displayOverviewPage = function displayOverviewPage(req, res) {
  res.render('overview_page');
};

var getStopDist = exports.getStopDist = function getStopDist(req, res) {
  model.getStopDist().then(function (results) {
    var arrayAll = new Array();
    results.forEach(function (result, index) {
      var start_date = new Date(result.start_date);
      var dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      var start_date_localeString = start_date.toLocaleString('en-US', dateOptions);
      var start_date_string = start_date_localeString.slice(5, 11) + '\n' + start_date_localeString.slice(0, 3);
      var array = [start_date_string, result.early, result.on_time, result.late, result.Very_late];
      arrayAll.push(array);
    });

    res.send(arrayAll); //JSON format
  });
};

var getTripDist = exports.getTripDist = function getTripDist(req, res) {
  model.getTripDist().then(function (results) {
    var arrayAll = new Array();
    results.forEach(function (result, index) {
      var start_date = new Date(result.start_date);
      var dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      var start_date_localeString = start_date.toLocaleString('en-US', dateOptions);
      var start_date_string = start_date_localeString.slice(5, 11) + '\n' + start_date_localeString.slice(0, 3);
      var array = [start_date_string, result.trip_early, result.trip_ontime, result.trip_late, 0];
      arrayAll.push(array);
    });

    res.send(arrayAll); //JSON format
  });
};

var getRouteDist = exports.getRouteDist = function getRouteDist(req, res) {
  model.getRouteDist().then(function (results) {
    var arrayAll = new Array();
    results.forEach(function (result, index) {
      var start_date = new Date(result.start_date);
      var dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      var start_date_localeString = start_date.toLocaleString('en-US', dateOptions);
      var start_date_string = start_date_localeString.slice(5, 11) + '\n' + start_date_localeString.slice(0, 3);
      var array = [start_date_string, result.route_early, result.route_ontime, result.route_late, 0];

      // //remove the last day
      // if(index != (results.length-1)){
      //   arrayAll.push(array);
      // }

      //keep all days
      arrayAll.push(array);
    });

    res.send(arrayAll); //JSON format
  });
};

var getRouteMap = exports.getRouteMap = function getRouteMap(req, res) {
  var route = req.query.route;
  var direction = req.query.direction;
  model.getRouteMap(route, direction).then(function (results) {
    // console.info(results);
    res.send(results);
  }).catch(function (error) {
    return console.error(error);
  });
};

var getStop = exports.getStop = function getStop(req, res) {
  var stopId = req.query.stopId;
  model.getStop(stopId).then(function (results) {
    // console.info(results);
    res.send(results);
  }).catch(function (error) {
    return console.error(error);
  });
};
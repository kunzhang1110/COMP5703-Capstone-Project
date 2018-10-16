'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStop = exports.getRouteMap = exports.getStopDist = exports.displayOverviewPage = exports.getRoute = exports.displayAboutPage = exports.displayRouteMainPage = undefined;

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

    console.log(results);
    var FAKE_DATA = [['20181002', 26, 699, 33, 12], ['20181003', 26, 232, 58, 60]];
    results = FAKE_DATA;
    res.send(results);
  });
};

var getRouteMap = exports.getRouteMap = function getRouteMap(req, res) {
  model.getRouteMap().then(function (results) {
    console.info(results);
    res.send(results);
  }).catch(function (error) {
    return console.error(error);
  });
};

var getStop = exports.getStop = function getStop(req, res) {
  model.getStop().then(function (results) {
    res.send(results);
  }).catch(function (error) {
    return console.error(error);
  });
};
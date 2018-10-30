'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStop = exports.getRouteMap = exports.getRoute = exports.getStopDist = undefined;

var _db = require('../models/db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ROUTE_TABLE_NAME = 'dbo.route_delay_with_name';
var STOP_DIST_NAME = 'dbo.web_stop_dist';

//Overview Level Analysis
var getStopDist = exports.getStopDist = function getStopDist() {
  return _db2.default.sql('SELECT * FROM ' + STOP_DIST_NAME).execute();
};

//Route Level Analysis
var getRoute = exports.getRoute = function getRoute() {
  return _db2.default.sql('SELECT * FROM ' + ROUTE_TABLE_NAME).execute();
};

//TODO: prejoin table
var getRouteMap = exports.getRouteMap = function getRouteMap() {
  var sql = 'select stops.stop_id as stopId, stops.stop_lat as lat, stops.stop_lon as lon, stops.stop_name as name, stop_times.stop_sequence as sequence from (select top 1 routes.route_short_name, trips.trip_id, trips.direction_id from routes join trips on routes.route_id = trips.route_id where routes.route_short_name = @route and trips.direction_id = @direction) as A join stop_times on A.trip_id = stop_times.trip_id join stops on stop_times.stop_id = stops.stop_id order by sequence';

  return _db2.default.sql(sql).execute();
};

var getStop = exports.getStop = function getStop() {
  var sql = 'select stops.stop_name as name, stop_delay.delay_desc as type, stop_delay.percentage as p from stops join stop_delay on stops.stop_id = stop_delay.stop_id where stops.stop_id = @stopId';
  return _db2.default.sql(sql).execute();
};
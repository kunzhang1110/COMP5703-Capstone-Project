'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStop = exports.getRouteMap = exports.getRoute = exports.getRouteDist = exports.getTripDist = exports.getStopDist = undefined;

var _db = require('../models/db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TYPES = require('tedious').TYPES;

var ROUTE_TABLE_NAME = 'dbo.route_delay_with_name';
var STOP_DIST_NAME = 'dbo.py15_stop_performance';
var TRIP_DIST_NAME = 'dbo.py15_trip_performance';
var ROUTE_DIST_NAME = 'dbo.py15_route_performance';

//Overview Level Analysis
var getStopDist = exports.getStopDist = function getStopDist() {
  return _db2.default.sql('SELECT * FROM ' + STOP_DIST_NAME).execute();
};

var getTripDist = exports.getTripDist = function getTripDist() {
  return _db2.default.sql('SELECT * FROM ' + TRIP_DIST_NAME).execute();
};

var getRouteDist = exports.getRouteDist = function getRouteDist() {
  return _db2.default.sql('SELECT * FROM ' + ROUTE_DIST_NAME).execute();
};

//Route Level Analysis
var getRoute = exports.getRoute = function getRoute() {
  return _db2.default.sql('SELECT * FROM ' + ROUTE_TABLE_NAME).execute();
};

//TODO: prejoin table
var getRouteMap = exports.getRouteMap = function getRouteMap(route, direction) {
  var sql = 'select TT_0925_stops.stop_id as stopId, TT_0925_stops.stop_lat as lat, TT_0925_stops.stop_lon as lon, TT_0925_stops.stop_name as name, TT_0925_stop_times.stop_sequence as sequence from (select top 1 TT_0925_routes.route_short_name, TT_0925_trips.trip_id, TT_0925_trips.direction_id from TT_0925_routes join TT_0925_trips on TT_0925_routes.route_id = TT_0925_trips.route_id where TT_0925_routes.route_short_name = @route and TT_0925_trips.direction_id = @direction) as A join TT_0925_stop_times on A.trip_id = TT_0925_stop_times.trip_id join TT_0925_stops on TT_0925_stop_times.stop_id = TT_0925_stops.stop_id order by sequence';

  return _db2.default.sql(sql).parameter('route', TYPES.NVarChar, route).parameter('direction', TYPES.Int, direction).execute();
};

var getStop = exports.getStop = function getStop(stopId) {
  var sql = 'select TT_0925_stops.stop_name as name, stop_delay.delay_desc as type, stop_delay.percentage as p from TT_0925_stops join stop_delay on TT_0925_stops.stop_id = stop_delay.stop_id where TT_0925_stops.stop_id = @stopId';
  return _db2.default.sql(sql).parameter('stopId', TYPES.NVarChar, stopId).execute();
};
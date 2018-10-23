import tp from '../models/db';

var TYPES = require('tedious').TYPES;

const ROUTE_TABLE_NAME = 'dbo.route_delay_with_name';
const STOP_DIST_NAME = 'dbo.web_stop_dist';


//Overview Level Analysis
export const getStopDist = function () {
  return tp.sql('SELECT * FROM ' + STOP_DIST_NAME)
    .execute();
};


//Route Level Analysis
export const getRoute = function () {
  return tp.sql('SELECT * FROM ' + ROUTE_TABLE_NAME)
    .execute();
};


//TODO: prejoin table
export const getRouteMap = function (route, direction) {
  let sql = 'select TT_0925_stops.stop_id as stopId, TT_0925_stops.stop_lat as lat, TT_0925_stops.stop_lon as lon, TT_0925_stops.stop_name as name, TT_0925_stop_times.stop_sequence as sequence from (select top 1 TT_0925_routes.route_short_name, TT_0925_trips.trip_id, TT_0925_trips.direction_id from TT_0925_routes join TT_0925_trips on TT_0925_routes.route_id = TT_0925_trips.route_id where TT_0925_routes.route_short_name = @route and TT_0925_trips.direction_id = @direction) as A join TT_0925_stop_times on A.trip_id = TT_0925_stop_times.trip_id join TT_0925_stops on TT_0925_stop_times.stop_id = TT_0925_stops.stop_id order by sequence';

  return tp.sql(sql)
    .parameter('route', TYPES.NVarChar, route)
    .parameter('direction', TYPES.Int, direction)
    .execute();
};


export const getStop = function (stopId) {
  let sql = 'select TT_0925_stops.stop_name as name, stop_delay.delay_desc as type, stop_delay.percentage as p from TT_0925_stops join stop_delay on TT_0925_stops.stop_id = stop_delay.stop_id where TT_0925_stops.stop_id = @stopId';
  return tp.sql(sql)
    .parameter('stopId', TYPES.NVarChar, stopId)
    .execute();
};

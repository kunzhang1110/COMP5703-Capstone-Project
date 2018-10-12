  var express = require('express');
var sql = require('mssql');
var request = require('./db');
var router = express.Router();
// get route information
router.get('/routemap', function (req, res, next){
	request.input('direction', sql.INT, req.query.direction)
	request.input('route', sql.NVarChar, req.query.route)
	request.query('select stops.stop_id as stopId, stops.stop_lat as lat, stops.stop_lon as lon, stops.stop_name as name, stop_times.stop_sequence as sequence from (select top 1 routes.route_short_name, trips.trip_id, trips.direction_id from routes join trips on routes.route_id = trips.route_id where routes.route_short_name = @route and trips.direction_id = @direction) as A join stop_times on A.trip_id = stop_times.trip_id join stops on stop_times.stop_id = stops.stop_id order by sequence', function (err, result){
		if(result){
			res.send(result.recordset);
		}else{
			console.log(err);
			res.send(err);
		}
	})
});
// get stop delay analysis data
router.get('/stop', function (req, res, next){
	request.input('stopId', sql.NVarChar, req.query.stopId)
	request.query('select stops.stop_name as name, stop_delay.delay_desc as type, stop_delay.percentage as p from stops join stop_delay on stops.stop_id = stop_delay.stop_id where stops.stop_id = @stopId', function (err, result){
		if(result){
			res.send(result.recordset);
		}else{
			console.log(err);
			res.send(err);
		}
	})
});

module.exports = router;
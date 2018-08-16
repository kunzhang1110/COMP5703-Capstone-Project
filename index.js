import request from 'request';
import gtfsRealtimeBindings from 'gtfs-realtime-bindings';
import fs from 'fs';
import dateFormat from 'dateformat';
//var mysql = require('mysql');


// request URIs
var apiUri = {
  realTimeTrip: 'https://api.transport.nsw.gov.au/v1/gtfs/realtime/',
  realTimeVehicle: 'https://api.transport.nsw.gov.au/v1/gtfs/vehiclepos/'
};

var tranportTypeUri = {
  bus : 'buses',
  lightRail : 'lightrail'
};

var url = apiUri.realTimeVehicle + tranportTypeUri.lightRail;
console.log('SEND REQUEST URL: '+url);

// sending request
var options = {
  url:url,
  method:'GET',
  encoding: null,
  headers:{
    'Connection': 'keep-alive',
    'Api-User-Agent': 'Example/1.0',
    'Authorization': 'apikey vTeeyq2hCQQRHF8sEey4hyWaNXz7ffWqEBh2'
  }
};

request(options,function(err, res, body){
  console.log('RESPONSE STATUS: ' + res.statusCode);
  let testFileName = dateFormat(new Date(res.headers.date), 'yyyy-mm-dd-HH-MM-ss');
  let feed = gtfsRealtimeBindings.FeedMessage.decode(body);
  feed.entity.forEach(function(entity) {
    if (entity.vehicle) {
      console.log(entity.vehicle.position);
      // let tripUpdate = JSON.stringify(entity.position);
      // fs.writeFile(`./data/${testFileName}.json`, tripUpdate, 'utf8', function (err) {
      //   if (err) {
      //     console.log(err);
      //   }
      // });
      // fs.appendFile(`./data/${testFileName}.json`, tripUpdate, (err) => {
      //   if (err) throw err;
      //   console.log(tripUpdate.log);
      // });
    }
  });
});

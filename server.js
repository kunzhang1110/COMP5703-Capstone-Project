import request from 'request';
import gtfsRealtimeBindings from 'gtfs-realtime-bindings';
// import fs from 'fs';
// import dateFormat from 'dateformat';
import express from 'express';
// import sassMiddleware from 'node-sass-middleware';
import path from 'path';
import bodyParser from 'body-parser'; //parsing POST body
import config from './config';
//var mysql = require('mysql');

const server = express(); //create express server
server.set('views', path.join(__dirname,'/src/views')); //set views
server.set('view engine', 'ejs'); //use ejs files in view directory
server.use(bodyParser.json());
server.use(express.static(path.join(__dirname, '/public')));

// routes
server.get('/', (req, res) =>{
  res.render('index');
});

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
  // let testFileName = dateFormat(new Date(res.headers.date), 'yyyy-mm-dd-HH-MM-ss');
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

server.listen(config.port, config.host, () => {
  console.info('Express listening on port ', config.port);
});


var TediousConnection = require('tedious').Connection;
var TediousRequest = require('tedious').Request;
var Request = require('request');
var gtfsRealtimeBindings = require('gtfs-realtime-bindings');
var TYPES = require('tedious').TYPES;

// Constants
var COMP5703_SERVER_CONFIG = {
  server: 'cp13.database.windows.net',
  userName: 'cp13',
  password: 'COMP5703comp',
  options: {
    database: 'COMP5703',
    requestTimeout: 0, //no timeout
    encrypt: true, //Set to true if on Windows Azure
  }
};
var TABLE_NAME = 'trip_updates_raw';
var TABLE = '[dbo].['+TABLE_NAME+']';
var API_URL = {
  realTimeTrip: 'https://api.transport.nsw.gov.au/v1/gtfs/realtime/',
  realTimeVehicle: 'https://api.transport.nsw.gov.au/v1/gtfs/vehiclepos/'
};
var TRANSPORT_TYPE_URI = {
  bus : 'buses',
  lightRail : 'lightrail',
  ferries: 'ferries'
};

// API URl variables
var url = API_URL.realTimeTrip + TRANSPORT_TYPE_URI.bus;
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
var start_time = Date.now();

// Define connection
var connection = new TediousConnection(COMP5703_SERVER_CONFIG);
connection.on('connect', err => { //main function
  var all_entity_rows;
  var bulkLoad;

  if (err){
    console.error(err);
  }else {
    console.info('Database Connected');

    getData().then(data => {
      all_entity_rows = data;
      return getBulkLoad(TABLE);
    }).then(bl => {
      bulkLoad = bl;
      saveToDatabase(bl, all_entity_rows);
    }).catch(err => {
      console.error(err);
    });
  }
});

/*
* Read metadata of existing table and return corresponding bulkLoad object on resolve
* @return {Promise} bulkLoad object on resolve
*/
function getBulkLoad(_table){
  return new Promise((resolve, reject) => {
    var bl;
    // make a dummy request
    let sql = 'SELECT TOP(1) * FROM ' + _table;
    let request = new TediousRequest(
      sql,
      function(err, rowCount, rows){
        if(!err){
          // console.info(rowCount + ' row(s) returned');
          resolve(bl);
        }else{
          reject(err);
        }
      });

    // retrive metadata of the table and set bulkLoad
    request.on('columnMetadata', function (columns) {
      bl = setBulkLoad(columns);
    });

    connection.execSql(request);
  });
}

/*
* set all columns of bulkLoad
* @param {Array<Column>} Array of column metadata Objects
* @return {Bulkload} Buckload Object with column metadata
*/
function setBulkLoad(columns){
  let bl = connection.newBulkLoad(TABLE,
    function (err, rowCount) { //bulckLoad on completion callback
      if(!err){
        console.info('inserted %d rows', rowCount);
        showExecutionTime(start_time);
        process.exit(0);
      }else{
        console.error(err);
      }
    });

  // add column metadata to bulkLoad
  for (let i = 0; i< columns.length; i++){
    let dataType = columns[i].type; //convert data type string to TYPE object
    let colName = columns[i].colName;
    bl.addColumn(colName ,dataType);  //column name and
  }

  //set nullability
  bl.columnsByName['vehicle_id'].nullable = true; //vehicle_id can be nullable
  return bl;
}

/*
* Get data from Transport Opendata and flatten them
* @return {Array<Array<Array>>} all flattened rows in a nested array
*/
function getData(){
  return new Promise((resolve,reject) =>{
    var all_entity_rows = [];
    Request(options,function(err, response, body){
      if (!err){
        console.info('OPENDATA RESPONSE STATUS: ' + response.statusCode);
        var feed_message = gtfsRealtimeBindings.FeedMessage.decode(body);
        var timestamp = feed_message.header.timestamp;
        for (let i in feed_message.entity){
          var entity = feed_message.entity[i];
          var entity_rows = processRows(entity, timestamp);
          if (entity_rows){
            all_entity_rows.push(entity_rows);
          }
        }
        resolve(all_entity_rows);
      }else{
        reject(err);
      }
    });
  });
}

function processRows(_entity, _timestamp){
  var timestamp = _timestamp;
  var entity_rows = [];
  if(_entity.trip_update && _entity.id){
    var entity_id = _entity.id;
    var trip_update = _entity.trip_update;
    if (trip_update.trip){  //trip_update must have a trip
      var trip = trip_update.trip;

      // check vehicle field exists
      var vehicle_id; // can be null
      if(trip_update.vehicle){
        vehicle_id = trip_update.vehicle.id;
      }

      //check fields in a trip are all non-null except for 'direction_id'
      var tripKeyArray = Object.keys(trip);
      for(let i=0;  i<tripKeyArray.length; i++){
        let keyName = tripKeyArray[i];
        let valueName = trip[tripKeyArray[i]];
        if (keyName == 'direction_id'){
          continue;
        }
        if (valueName == null){
          return null;
        }
      }
      var trip_id = trip.trip_id;
      var start_time = trip.start_time;
      var start_date = trip.start_date;
      var trip_schedule_relationship = trip.schedule_relationship;
      var route_id = trip.route_id;

      //check stop_time_update
      if (trip_update.stop_time_update){
        var stop_time_updates = trip_update.stop_time_update;
      } else{
        return null;
      }

      //flatten each trip_update
      for (let x in stop_time_updates){
        let update = stop_time_updates[x];
        if(checkUpdate(update) == false){
          break;
        }else{
          var stop_id = update.stop_id;
          var schedule_relationship = update.schedule_relationship;
          var stop_sequence = update.stop_sequence;
          var arrival = update.arrival;
          var arrival_delay = arrival.delay;
          var arrival_time = arrival.time;
          var departure = update.departure;
          var departure_delay = departure.delay;
          var departure_time = departure.time;
          let row = [entity_id, timestamp, trip_id, start_time, start_date,
            trip_schedule_relationship, stop_sequence, arrival_delay,arrival_time,departure_delay,
            route_id, vehicle_id, departure_time, stop_id, schedule_relationship];
          entity_rows.push(row);
        }
      } // END flatten each trip_update
      return entity_rows;
    }
  }
}

/*
* check fields in a update are all non-null
* @param {Object} update object
* @param {Boolean} true if all fields are non-null
*/
function checkUpdate(_update){

  var updateKeyArray = Object.keys(_update);
  for(let i=0;  i<updateKeyArray.length; i++){

    let keyName = updateKeyArray[i];
    let valueName = _update[updateKeyArray[i]];
    if (valueName == null){
      return false;
    }
  }
  return true;
}


/*
* Save all rows into database with bulkLoad
* @param {Connection} database Connection Object
* @param {Bulkload} configured Buckload Object
* @param {String} list of rows
*/
function saveToDatabase(_bulkLoad, _all_entity_rows){
  console.info('Start inserting to database');
  for (let i in _all_entity_rows){
    let entity_rows = _all_entity_rows[i];
    for (let j in entity_rows){
      let row = entity_rows[j];
      _bulkLoad.addRow(row);
    }
  }
  connection.execBulkLoad(_bulkLoad);
}

/*
* Convert a data type string to corresponding data type object defined in TYPES
* @param {String} data type string
* @return {TYPES} data type object
*/
function convertDataType(_dataTypeString){
  let allTypeNames = Object.keys(TYPES);
  let dataTypeObjectName = allTypeNames.find(function(element){
    if(element.toLowerCase() === _dataTypeString)
      return element;
  });
  return TYPES[dataTypeObjectName];
}

/*
* Show exeuction time on console
* @param {int} start time for execution in millisencionds (2 digit precision)
* @return {int} execution time in millisencionds
*/
function showExecutionTime(_start){
  let execTime = Date.now() - _start;
  console.info('Execution time is: ' + (execTime/60000).toFixed(2) + 'minutes' +
  '('+ execTime + ' milliseconds' + ')');
}


/**
 * Data Fetching Script
 *
 */

var TediousConnection = require('tedious').Connection;
var TediousRequest = require('tedious').Request;
var Request = require('request');
var gtfsRealtimeBindings = require('gtfs-realtime-bindings');
// var Moment = require('moment');
var TYPES = require('tedious').TYPES;

// Constants
var COMP5703_SERVER_CONFIG = {
  server: 'cp5703.database.windows.net',
  userName: 'cp13',
  password: 'COMP5703comp',
  options: {
    database: 'COMP5703',
    requestTimeout: 0, //no timeout
    encrypt: true, //set to true if on Windows Azure
  }
};
var TABLE_NAME = 'trip_update_all_sequence';
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
var NULLABLE_COLUMNS = ['start_time', 'trip_schedule_relationship',
  'arrival_delay', 'arrival_time', 'departure_delay', 'vehicle_id',
  'stop_schedule_relationship'];
var NON_NULLABLE_COLUMNS = ['entity_id', 'timestamp', 'route_id', 'trip_id',
  'start_date', 'stop_id', 'stop_sequence', 'departure_time'];
var STOP_SEQUENCE_SELECTION_NUMBER = 1000;
var SYDNEY_TIME_OFFSET = 10 * 60 * 60; //UTC+10 in seconds

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
var execution_start_time = Date.now();

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
      saveToDatabase(bulkLoad, all_entity_rows);
    }).catch(err => {
      console.error(err);
    });
  }
});

/**
* Read metadata of existing table and return corresponding bulkLoad object on resolve
* @async
* @return {Promise<BulkLoad>} BulkLoad object on resolve
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

/**
* Set all columns of bulkLoad
* @param {Array<Column>} columns - Array of column metadata Objects
* @return {Bulkload} Buckload Object with column metadata
*/
function setBulkLoad(columns){
  let bl = connection.newBulkLoad(TABLE,
    function (err, rowCount) { //bulckLoad on completion callback
      if(!err){
        console.info('inserted %d rows', rowCount);
        showExecutionTime(execution_start_time);
        process.exit(0);
      }else{
        console.error(err);
      }
    });

  // add column metadata to bulkLoad
  for (let i = 0; i< columns.length; i++){
    let dataType = columns[i].type; //convert data type string to TYPE object
    let colName = columns[i].colName;
    let dataTypeName = dataType.name;

    // tedious library read some nullable type abc as abcN; convert abcN back to abcN
    if(dataTypeName.slice(-1)== 'N'){  //if dataType is nullable
      dataTypeName = dataTypeName.slice(0,-1);
    }

    if (NULLABLE_COLUMNS.indexOf(colName) > -1){ //if colname is in NULLABLE_COLUMNS
      bl.addColumn(colName ,TYPES[dataTypeName], {nullable:true});
    }else{
      bl.addColumn(colName ,TYPES[dataTypeName], {nullable:false});
    }
    // console.info(bl.columnsByName[colName]);
  }
  return bl;
}

/**
* Get data from Transport Opendata and flatten them
* @async
* @return {Promise<Array<Array<row>>>} All flattened rows in a nested array
*/
function getData(){
  return new Promise((resolve,reject) =>{
    var all_entity_rows = [];
    Request(options,function(err, response, body){
      if (!err){
        console.info('OPENDATA RESPONSE STATUS: ' + response.statusCode);
        try{ //if feed_message and timestamp not present, program will restart in Azure
          var feed_message = gtfsRealtimeBindings.FeedMessage.decode(body);
          var timestamp = feed_message.header.timestamp;
        } catch(e){
          console.error(e);
          process.exit(0);  //proces exit
        }
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

/**
* Get data from Transport Opendata and flatten them
* @param {Object<entity>} _entity - Single entity Object
* @param {uint64} _timestamp - Feed message timestamp
* @return {Promise<Array<Array<row>>>} All flattened rows in a nested array
*/
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

      // if non-null fields contain null value
      if(checkNull(trip) == false){
        return null;
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
      let squenceCounter = 1;
      for (let x in stop_time_updates){

        if(squenceCounter > STOP_SEQUENCE_SELECTION_NUMBER){
          break;
        }

        let update = stop_time_updates[x];
        if(checkNull(update) == false){
          break;
        }else{
          var stop_id = update.stop_id;
          var schedule_relationship = update.schedule_relationship;
          var stop_sequence = update.stop_sequence;
          var arrival = update.arrival;
          var arrival_delay = arrival.delay;
          arrival.time.low += SYDNEY_TIME_OFFSET; // arrival time is long
          var arrival_time = arrival.time;
          var departure = update.departure;
          if(departure.time == null){ //departure_time cannot be null
            break;
          }
          var departure_delay = departure.delay;
          departure.time.low += SYDNEY_TIME_OFFSET; // departure time is long
          var departure_time = departure.time;
          let row = [entity_id, timestamp, route_id, trip_id, start_time, start_date,
            trip_schedule_relationship, stop_id, stop_sequence, arrival_delay,arrival_time,departure_delay,
            departure_time, vehicle_id, schedule_relationship];
          entity_rows.push(row);
          squenceCounter ++;
        }
      } // END flatten each trip_update
      return entity_rows;
    }
  }
}

/**
* check fields in an object are all non-null
* @param {Object<stop_time_update>} _checkObject - Single object
* @return {Boolean} True if all fields are non-null
*/
function checkNull(_checkObject){
  var updateKeyArray = Object.keys(_checkObject);
  for(let i=0;  i<updateKeyArray.length; i++){
    let keyName = updateKeyArray[i];
    let valueName = _checkObject[updateKeyArray[i]];
    if (NON_NULLABLE_COLUMNS.indexOf(keyName)>-1){  //if keyName is in NON_NULLABLE_COLUMNS
      if (valueName == null){
        return false;
      }
    }
  }
  return true;
}


/**
* Save all rows into database with bulkLoad
* @param {Object<Bulkload>} _bulkLoad - Configured Buckload Object
* @param {Array} _all_entity_rows - List of all rows
*/
function saveToDatabase(_bulkLoad, _all_entity_rows){
  // var counter = 0;
  console.info('Start inserting to database');
  for (let i in _all_entity_rows){
    let entity_rows = _all_entity_rows[i];
    for (let j in entity_rows){
      let row = entity_rows[j];

      _bulkLoad.addRow(row);
      // counter ++;
      // if(counter > 200){
      //   // console.log(counter)
      //   break;
      // }
    }
  }
  connection.execBulkLoad(_bulkLoad);
}

// /**
// * Convert a data type string to corresponding data type object defined in TYPES
// * @param {String} _dataTypeString - Data type string
// * @return {Object<TYPES>} Data type object
// */
// function convertDataType(_dataTypeString){
//   let allTypeNames = Object.keys(TYPES);
//   let dataTypeObjectName = allTypeNames.find(function(element){
//     if(element.toLowerCase() === _dataTypeString)
//       return element;
//   });
//   return TYPES[dataTypeObjectName];
// }

/**
* Show exeuction time on console
* @param {int} _start - Start time for execution in millisencionds (2 digit precision)
* @return {float} Execution time in minutes
*/
function showExecutionTime(_start){
  let execTimeMillis = Date.now() - _start;
  let execTimeMinutes = execTimeMillis/60000;
  console.info('Execution time is: ' + execTimeMinutes.toFixed(2) + ' minute(s) ' +
  '('+ execTimeMillis + ' ms' + ')');
  return execTimeMinutes;
}

module.exports = {
  showExecutionTime
};

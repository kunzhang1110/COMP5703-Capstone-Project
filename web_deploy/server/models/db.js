'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _tediousPromises = require('tedious-promises');

var _tediousPromises2 = _interopRequireDefault(_tediousPromises);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Create connection to database
var COMP5703_SERVER_CONFIG = {
  server: 'cp5703.database.windows.net',
  userName: 'cp13',
  password: 'COMP5703comp',
  options: {
    database: 'COMP5703',
    requestTimeout: 0, //no timeout
    encrypt: true //set to true if on Windows Azure
  }
};

_tediousPromises2.default.setConnectionConfig(COMP5703_SERVER_CONFIG);

exports.default = _tediousPromises2.default;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var env = process.env;

var nodeEnv = exports.nodeEnv = env.NODE_ENV || 'development';

exports.default = { //default export of this module
  mongodbUri: 'mongodb://localhost:27017/test',
  port: env.PORT || 1337,
  host: env.HOST || '0.0.0.0',
  get serverUrl() {
    //ES6 getter
    return 'http://' + this.host + ':' + this.port;
  }
};
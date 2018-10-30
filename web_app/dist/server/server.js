'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _router = require('./routes/router.js');

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import sassMiddleware from 'node-sass-middleware';
var SERVER = (0, _express2.default)();

// SERVER.use(sassMiddleware({
//   src: path.join(__dirname, 'sass'),
//   dest: path.join(__dirname, '..', 'public')
// }));  //compile scss

SERVER.use(_bodyParser2.default.json());
SERVER.use(_express2.default.static(_path2.default.join(__dirname, '..', 'public')));

// Set views
SERVER.set('views', _path2.default.join(__dirname, 'views'));
SERVER.set('view engine', 'ejs');

SERVER.use('/', _router2.default);

SERVER.listen(_config2.default.port, _config2.default.host, function () {
  console.info('Express listening on port ', _config2.default.port);
});

exports.default = SERVER;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _model = require('../models/model');

var model = _interopRequireWildcard(_model);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var api_router = _express2.default.Router();

api_router.get('/getRoute', function (req, res) {
  model.getRoute().then(function (results) {
    res.send(results);
  });
});

api_router.get('/getStopStatic', function (req, res) {
  model.getStopStatic().then(function (results) {
    res.send(results);
  });
});

api_router.get('/getStop', function (req, res) {
  model.getStop(req.query.stopId).then(function (results) {
    res.send(results);
  });
});

exports.default = api_router;
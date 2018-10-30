'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _controller = require('../controllers/controller');

var controller = _interopRequireWildcard(_controller);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/route', controller.displayRouteMainPage);
router.get('/getRoute', controller.getRoute);
router.get('/routemap', controller.getRouteMap);
router.get('/stop', controller.getStop);
router.get(['/', '/overview'], controller.displayOverviewPage);
router.get('/getStopDist', controller.getStopDist);
router.get('/about', controller.displayAboutPage);

exports.default = router;
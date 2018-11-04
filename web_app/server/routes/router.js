import express from 'express';
import * as controller from '../controllers/controller';

const router = express.Router();

router.get('/route', controller.displayRouteMainPage);
router.get('/getRoute', controller.getRoute);
router.get('/routemap', controller.getRouteMap);
router.get('/stop', controller.getStop);
router.get('/overview', controller.displayOverviewPage);
router.get('/getStopDist', controller.getStopDist);
router.get('/getTripDist', controller.getTripDist);
router.get('/getRouteDist', controller.getRouteDist);
router.get('/predictive', controller.displayPredictivePage);
router.get('/about', controller.displayAboutPage);

export default router;

import express from 'express';
import * as controller from '../controllers/controller';

const router = express.Router();

router.get('/route', controller.displayRouteMainPage);
router.get('/getRoute', controller.getRoute);



export default router;

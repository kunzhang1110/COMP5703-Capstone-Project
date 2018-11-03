import express from 'express';
import * as model from '../models/model';

const api_router = express.Router();

api_router.get('/getRoute', (req, res) => {
  model.getRoute().then(results=>{
    res.send(results);
  });
});

api_router.get('/getStopStatic', (req, res) => {
  model.getStopStatic().then(results=>{
    res.send(results);
  });
});

api_router.get('/getStop', (req, res) => {
  model.getStop(req.query.stopId).then(results=>{
    res.send(results);
  });
});

export default api_router;

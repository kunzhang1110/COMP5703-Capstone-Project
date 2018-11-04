import express from 'express';

import path from 'path';
import bodyParser from 'body-parser';
import config from './config';
import router from './routes/router.js';
import api_router from './routes/api_router.js';
const SERVER = express();

// import sassMiddleware from 'node-sass-middleware';
// SERVER.use(sassMiddleware({
//   src: path.join(__dirname, 'sass'),
//   dest: path.join(__dirname, '..', 'public')
// }));  //compile scss

SERVER.use(bodyParser.json());
SERVER.use(express.static(path.join( __dirname,'..', 'public')));

// Set views
SERVER.set('views', path.join(__dirname, 'views'));
SERVER.set('view engine', 'ejs');

SERVER.get('/', (req,res)=>{
  res.render('overview_page');
});

SERVER.use('/',router);
SERVER.use('/api',api_router);

SERVER.listen(config.port, config.host, () => {
  console.info('Express listening on port ', config.port);
});

export default SERVER;

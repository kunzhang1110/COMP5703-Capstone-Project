import tp from 'tedious-promises';

//Create connection to database
const COMP5703_SERVER_CONFIG = {
  server: 'cp5703.database.windows.net',
  userName: 'cp13',
  password: 'COMP5703comp',
  options: {
    database: 'COMP5703',
    requestTimeout: 0, //no timeout
    encrypt: true, //set to true if on Windows Azure
  }
};

tp.setConnectionConfig(COMP5703_SERVER_CONFIG);

export default tp;

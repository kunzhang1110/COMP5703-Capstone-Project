const env = process.env;

export const nodeEnv = env.NODE_ENV || 'development';

export default { //default export of this module
  mongodbUri: 'mongodb://localhost:27017/test',
  port: env.PORT || 3000,
  host: env.HOST || '0.0.0.0',
  get serverUrl(){//ES6 getter
    return `http://${this.host}:${this.port}`;
  }
};

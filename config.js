const env = process.env;  //process.env is defined in nodejs process module

export default { //default export of this module
  port: env.PORT || 3000,
  host: env.HOST || '0.0.0.0',
  get serverUrl(){//ES6 getter
    return `http://${this.host}:${this.port}`;
  }
};

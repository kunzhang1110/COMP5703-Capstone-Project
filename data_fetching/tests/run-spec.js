// Chai.js is a assertion library
//
const asserttype = require('chai-asserttype');
const chai = require('chai').use(asserttype);
const expect = chai.expect;
const run = require('../run.js');

//
describe ('showExecutionTime', ()=>{
  it('should display execution time',(done) => {
    let execTimeMinutes = run.showExecutionTime(Date.now() - 60000);
    expect(execTimeMinutes).to.be.within(0,1.1);
    done();
  });
});

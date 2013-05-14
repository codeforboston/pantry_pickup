var should = require('should'),
    request = require('supertest'),
    path = require('path');

var app = require(path.join(__dirname, '../../lib/app'));

describe('Pantry', function() {
  describe('#list', function() {
    it('should respond with a status code of 200 and a list of pantries', function(done) {
      request(app)
        .get('/pantry')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) throw err;
          done();
        });
    }),
    it('should list of pantries each with a name, location, etc.', function(done) {
      request(app)
        .get('/pantry')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) throw err;
          done();
        });
    })
  })
})
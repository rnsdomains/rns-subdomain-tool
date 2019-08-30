var config = require('../config.json')
var chai = require('chai')
var chaiHttp = require('chai-http');
var server = 'http://localhost:' + config.port;

chai.use(chaiHttp)
var expect = chai.expect;

describe('GET /status', () => {
  it('should respond with true', (done) => {
    chai.request(server).get('/status')
    .end((err, res) => {
      expect(res.body).to.be.true;
      expect(res).to.have.status(200);
      expect(err).to.be.null;
      done();
    });
  });
});

describe('GET /transactionStatus', function() {
  describe('Sending a successful txhash', function() {
    it('should respond with SUCCESS and httpcode 200', function(done) {
      this.timeout(60000);
      chai.request(server).get('/transactionStatus')
      .query({"txHash": "0xd4dd93ffa1b51d9e41e4a9b5759792b9a49a42c4833240f6ed4ecd366620dba2"})
      .end(function(err, res) {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.body.status).to.have.string('SUCCESS');
        done();
      });
    });
  });
  describe('Sending a failed txhash', function() {
    it('should respond with FAILED and httpcode 200', function(done) {
      this.timeout(60000);
      chai.request(server).get('/transactionStatus')
      .query({"txHash": "0xa45a8ea08751f673987170bf175c959768793b58abbe650c1dbb33e1a01fc19a"})
      .end(function(err, res) {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.body.status).to.have.string('FAILED');
        done();
      });
    });
  });
  describe('Sending an inexistent txhash', function() {
    it('should respond with NOT FOUND and httpcode 200', function(done) {
      this.timeout(60000);
      chai.request(server).get('/transactionStatus')
      .query({"txHash": "0xa45a8ea08751f673987170bf175c959768793b58abbe650c1dbb33e1a01fc192"})
      .end(function(err, res) {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.body.status).to.have.string('NOT_FOUND');
        done();
      });
    });
  });
  describe('Sending a request without a txhash', function() {
    it('should respond with an error and httpcode 400', function(done) {
      this.timeout(60000);
      chai.request(server).get('/transactionStatus')
      .query({"txHash": "hello"})
      .end(function(err, res) {
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(res.body.details).not.to.be.null;
        expect(res.body.details).to.have.string('Invalid tx hash');
        done();
      });
    });
  });
});

describe('GET /subdomainStatus', function() {
  describe('Subdomain with owner', function() {
    it('should respond with OWNED and httpcode 200', function(done) {
      this.timeout(60000);
      chai.request(server).get('/subdomainStatus')
      .query({"subdomain": "meri.consensus.rsk"})
      .end(function(err, res) {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.body.status.status).to.have.string('OWNED');
        expect(res.body.status.owner).to.have.string('0x459b921fe5367e472f219f9ec9386ef02d7f7fe7');
        done();
      });
    });
  });
  describe('Subdomain free (without owner)', function() {
    it('should respond with AVAILABLE and httpcode 200', function(done) {
      this.timeout(60000);
      chai.request(server).get('/subdomainStatus')
      .query({"subdomain": "prueba100.consensus.rsk"})
      .end(function(err, res) {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.body.status.status).to.have.string('AVAILABLE');
        done();
      });
    });
  });
  describe('Invalid subdomain format', function() {
    it('should respond with an error', function(done) {
      this.timeout(60000);
      chai.request(server).get('/subdomainStatus')
      .query({"subdomain": "error*sub.example.rsk"})
      .end(function(err, res) {
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(res.body.details).to.have.string('Invalid RNS domain');
        done();
      });
    });
  });
  describe('Invalid subdomain format - parent tail', function() {
    it('should respond with an error', function(done) {
      this.timeout(60000);
      chai.request(server).get('/subdomainStatus')
      .query({"subdomain": "error*sub.other-example.rsk"})
      .end(function(err, res) {
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(res.body.details).to.have.string('Invalid RNS domain');
        done();
      });
    });
  });
  describe('Invalid subdomain quantity of levels', function() {
    it('should respond with an error', function(done) {
      this.timeout(60000);
      chai.request(server).get('/subdomainStatus')
      .query({"subdomain": "error.sub.example.rsk"})
      .end(function(err, res) {
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(res.body.details).to.have.string('Invalid RNS domain');
        done();
      });
    });
  });
});

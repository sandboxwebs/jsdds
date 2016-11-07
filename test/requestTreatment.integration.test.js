/// Load environment

var env = require('node-env-file');
env(__dirname + '/../.env');

var supertest = require('supertest');
var should = require('should');
var model = require('../models/models');
var request = supertest.agent('http://localhost:' + process.env.SCIROCCO_PORT);
var server;
var config = require('../config');


describe('Testing request treatment.', function () {


    beforeEach(function (done) {
        delete require.cache[require.resolve('../bin/www')];
        server = require('../bin/www');
        model.message.remove({}, done);
    });

    afterEach(function (done) {
        server.close(function () {
            model.message.remove({}, done);
        });
    });

    it("Should return 400 when no content type in POST. With message showing available options",
        function (done) {

            request.post(config.paths.messageQueue)
                .set('Authorization', config.master_token)
                .set(config.headers.from, 'af123')
                .set(config.headers.to, 'af123')
                .send('string')
                .expect(400)
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    (res.body).should.be.an.instanceOf(Object);
                    (res.body).should.have.property('message');
                    (res.body.message).should.be.equal("Please, specify a valid Content-Type values. " +
                        "Valid choices are .. " + config.contentsAllowed.join(', '));
                    done();
                });
        });

    it("It should return scirocco type, independent from Content-Type generated by expressjs.",
        function (done) {

            request.post(config.paths.messageQueue)
                .set('Authorization', config.master_token)
                .set(config.headers.from, 'af123')
                .set(config.headers.to, 'af123')
                .set(config.headers.data_type, '.tar.gz')
                .set('Content-Type', 'text/plain')
                .send('string')
                .expect(201)
                .end(function (err, res) {

                    if (err) throw err;
                    request.get(config.paths.messageQueue)
                        .set('Authorization', config.master_token)
                        .set(config.headers.from, 'af123')
                        .expect(200)
                        .expect('Content-Type', /text\/html/)
                        .expect(config.headers.data_type, '.tar.gz')
                        .end(function (err, res) {
                            if (err) throw err;
                            done();
                        });
                });
        });

    it("It should return scirocco data type copied from content-type if no scirocco data type specified.",
        function (done) {

            request.post(config.paths.messageQueue)
                .set('Authorization', config.master_token)
                .set(config.headers.from, 'af123')
                .set(config.headers.to, 'af123')
                .set('Content-Type', 'text/plain')
                .send('string')
                .expect(201)
                .end(function (err, res) {

                    if (err) throw err;
                    request.get(config.paths.messageQueue)
                        .set('Authorization', config.master_token)
                        .set(config.headers.from, 'af123')
                        .expect(200)
                        .expect('Content-Type', /text\/html/)
                        .expect(config.headers.data_type, 'text/plain')
                        .end(function (err, res) {
                            if (err) throw err;
                            done();
                        });
                });
        });
});
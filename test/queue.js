/// Load environment

var env = require('node-env-file');
env(__dirname + '/../.env');

var supertest = require('supertest');
var should = require('should');
var model = require('../models/models');

var request = supertest.agent('http://localhost:' + process.env.APP_PORT);
var server;
var path = '/queue';
var token = 'DEFAULT_TOKEN';
var fromHeader = 'DDS-node-id';
var fromHeaderValue = 'af123';


describe('Testing queue resource.', function () {

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

    it("Should pull a message from queue", function(done){

        var messages = [
            {
                to_node_id: fromHeaderValue,
                from_node_id: fromHeaderValue,
                status: "pending",
                data: {name: "test"},
                type: "email"
            },
            {
                to_node_id: fromHeaderValue,
                from_node_id: fromHeaderValue,
                status: "pending",
                data: {name: "test"},
                type: "email"
            },
            /// This message must not be deleted, because it not belongs or emitted
            /// to testing node.
            {
                to_node_id: fromHeaderValue + "23",
                from_node_id: fromHeaderValue + "23",
                status: "pending",
                data: {name: "test"},
                type: "email"
            }
        ];

        model.message.insertMany(messages);

        request.get(path)
            .set('Authorization', token)
            .set(fromHeader, fromHeaderValue)
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end(function(err, res){





            });
    })


});
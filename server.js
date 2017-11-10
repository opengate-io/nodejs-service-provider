'use strict';

var Http = require('http');
var Express = require('express');
var BodyParser = require('body-parser');
var Swaggerize = require('swaggerize-express');
var CollectorHandler = require('./collector-handler');
var Path = require('path');
var Log = require('timestamp-log');
var log = new Log(process.env.LOG_LEVEL);

require('dotenv').config();

var App = Express();

var Server = Http.createServer(App);

App.use(BodyParser.json());
App.use(BodyParser.urlencoded({
    extended: true
}));
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');
App.use('/docs/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
App.use(Swaggerize({
    api: Path.resolve('./config/swagger.yaml'),
    handlers: Path.resolve('controllers')
}));
App.use(function (err, req, res, next) {
    log.error('MessageServiceCollector:', err);
    res.status(500).send(err);
});
Server.listen(8000, function () {
    App.swagger.api.host = this.address().address + ':' + this.address().port;
    /* eslint-disable no-console */
    log.info('MessageServiceCollector: %s:%d', this.address().address, this.address().port);
    /* eslint-disable no-console */
    var collectorHandler = new CollectorHandler();
    collectorHandler.start();
});

/*
 CollectorHandler.js simulates a small CollectorHandler generating telemetry.
*/
const Log = require('timestamp-log');
const log = new Log(process.env.LOG_LEVEL);
const kafka = require('kafka-node');
const database = require('./connectors/cassandra');
const serviceProvider = require('./providers/' + process.env.NODEJS_SERVICE_PROVIDER.toLowerCase());

function CollectorHandler() {
    this.listeners = [];
    this.kafkaZookeeperString = process.env.KAFKA_ZOOKEEPER_HOST;
    var client = new kafka.Client(this.kafkaZookeeperString + '/');
    this.consumer = new kafka.HighLevelConsumer(
        client, [{
            topic: process.env.KAFKA_MESSAGES_TOPIC
        }], {
            autoCommit: false,
            fromOffset: false
        }
    );
    this.consumer.on('message', (message) => {
        try {
            log.debug(message);
            var objectValue = JSON.parse(message.value);
            if (Array.isArray(objectValue)) {
                objectValue.map(function (message) {
                    this.sendMessagesToServiceProvider(message);
                });
            } else {
                this.sendMessagesToServiceProvider(objectValue);
            }
        } catch (e) {
            if ((e instanceof SyntaxError)) {
                log.debug('Invalid JSON message', message.value);
            } else {
                log.debug('Unknown exception', e);
            }
            this.consumer.commit(function (err, data) {
                log.debug('Commit', err ? err : 'Success!', data);
            });
        }
    });
}

/**
 * Takes a measurement of CollectorHandler state, stores in history, and notifies listeners.
 */
CollectorHandler.prototype.sendMessagesToServiceProvider = function (message) {
    if (process.env.MESSAGE_SERVICE_ENABLED === 'YES' && message) {
        log.debug('deliverMessage:', message);
        serviceProvider.deliverMessage(message, (err, response) => {
            if (!err) {
                database.updateMessage('SUCCESS', message.message_id, message.reference_id);
                this.consumer.commit(function (err, data) {
                    log.debug('MessageServiceCollector:', err ? err : 'FINISHED!', message.message_id);
                });
                log.debug('deliverMessage:', response);
            } else {
                database.updateMessage('ERROR', message.message_id, message.reference_id);
                log.debug('deliverMessage:', err);
                this.consumer.commit(function (err, data) {
                    log.debug('MessageServiceCollector:', err ? err : 'FINISHED!', message.message_id);
                });
            }
        });
    } else {
        database.updateMessage('SUCCESS', message.message_id, message.reference_id);
        this.consumer.commit(function (err, data) {
            log.debug('MessageServiceCollector:', err ? err : 'FINISHED!', message.message_id);
        });
        log.debug('deliverMessage:', response);
    }
};

CollectorHandler.prototype.start = function () {
    /*eslint no-console: ['error', { allow: ['warn', 'error', 'log'] }] */
    log.info('MessageServiceCollector:' + this.kafkaZookeeperString);
};

module.exports = function () {
    return new CollectorHandler();
};
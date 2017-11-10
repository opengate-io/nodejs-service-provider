'use strict';
const Log = require('timestamp-log');
const Guid = require('guid');
const kafka = require('kafka-node');
const log = new Log(process.env.LOG_LEVEL);
const database = require('./cassandra');
/**
 * Operations on /connectors/publisher
 */
module.exports = {
    /**
     * summary: [Public] Connector exposed method.
     * description: Publish a message into Kafka.
     * parameters: messageLinks, messageObject, referenceId, tags
     * produces: application/json
     * responses: callback(error, response)
     * operationId: sendMessage
     */
    sendMessage: function (messageLinks, messageObject, referenceId, tags, callback) {
        var kafkaZookeeperString = process.env.KAFKA_ZOOKEEPER_HOST;
        var client = new kafka.Client(kafkaZookeeperString + '/');
        var producer = new kafka.HighLevelProducer(client);
        producer.on('ready', function () {
            database.createMessage(messageLinks, messageObject, referenceId, tags, function (err, result) {
                if (!err) {
                    var payloads = [{
                        topic: process.env.KAFKA_MESSAGES_TOPIC,
                        messages: JSON.stringify({
                            message_id: result.message_id,
                            reference_id: result.reference_id,
                            links: messageLinks,
                            message: messageObject
                        })
                    }];
                    log.debug('MessageServiceCollector:', 'STARTED!', result.message_id);
                    producer.send(payloads, function (err, respose) {
                        if (!err) {
                            /* Response to HTTP request */
                            callback(null, result);
                            log.debug(result);
                        } else {
                            database.updateMessage('ERROR', result.message_id, result.reference_id);
                            callback({
                                'code': 'error-kafka-queue-public',
                                'message': 'Pushing message to Kafka queue failed.'
                            });
                            log.error(err);
                        }
                    });
                } else {
                    callback({
                        'code': 'error-create-message',
                        'message': 'Creating message tracker failed.'
                    });
                    log.error(err);
                }
            });
        });
    },
    /**
     * summary: [Public] Connector exposed method.
     * description: Publish a message into Kafka.
     * parameters: messageLinks, messageObject, referenceId
     * produces: application/json
     * responses: callback(error, response)
     * operationId: sendMessage
     */
    rollbackMessage: function (messageId, messageLinks, messageObject, referenceId, callback) {
        var kafkaZookeeperString = process.env.KAFKA_ZOOKEEPER_HOST;
        var client = new kafka.Client(kafkaZookeeperString + '/');
        var producer = new kafka.HighLevelProducer(client);
        producer.on('ready', function () {
            database.updateMessage("ROLLBACK", messageId, referenceId, function (err, result) {
                if (!err) {
                    var payloads = [{
                        topic: process.env.KAFKA_MESSAGES_TOPIC,
                        messages: JSON.stringify({
                            message_id: result.message_id,
                            reference_id: result.reference_id,
                            links: messageLinks,
                            message: messageObject
                        }),
                        partition: parseInt(process.env.KAFKA_MESSAGES_PARTITION)
                    }];
                    log.debug('MessageServiceCollector:', 'STARTED!', result.message_id);
                    producer.send(payloads, function (err, respose) {
                        if (!err) {
                            /* Response to HTTP request */
                            callback(null, result);
                            log.debug(result);
                        } else {
                            database.updateMessage('ERROR', result.message_id, result.reference_id);
                            callback({
                                'code': 'error-kafka-queue-public',
                                'message': 'Pushing message to Kafka queue failed.'
                            });
                            log.error(err);
                        }
                    });
                } else {
                    callback({
                        'code': 'error-rollback-message',
                        'message': 'Rollbacking message tracker failed.'
                    });
                    log.error(err);
                }
            });
        });
    }
};
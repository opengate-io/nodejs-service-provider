'use strict';
const Log = require('timestamp-log');
const Guid = require('guid');
const cassandra = require('cassandra-driver');
const log = new Log(process.env.LOG_LEVEL);
const cassandraContactPoints = [process.env.CASSANDRA_HOST_PRIMARY || 'cassandra-database', process.env.CASSANDRA_HOST_SECONDARY || 'localhost']
const cassandraTrackingTable = process.env.CASSANDRA_TRACKING_TABLE || 'samples.message_tracker'
const cassandraKeyspaceName = process.env.CASSANDRA_KEYSPACE_NAME || 'samples'

const buildQueriesFromParams = (query) => {
    let builtQueries = 'SELECT id, status, tags, owners, object, reference_id, created_at, delivered_at FROM ' + cassandraTrackingTable + ' WHERE';
    let builtParams = [];
    if (query.status) {
        builtQueries += builtParams.length > 0 ? ' AND ' : ' ';
        builtQueries += 'status = ?'
        builtParams.push(query.status);
    }
    if (query.owner) {
        builtQueries += builtParams.length > 0 ? ' AND ' : ' ';
        builtQueries += 'owners CONTAINS ?'
        builtParams.push(query.owner);
    }
    if (query.tag) {
        builtQueries += builtParams.length > 0 ? ' AND ' : ' ';
        builtQueries += 'tags CONTAINS ?'
        builtParams.push(query.tag);
    }
    if (query.start) {
        builtQueries += builtParams.length > 0 ? ' AND ' : ' ';
        builtQueries += 'created_at >= ?'
        builtParams.push(query.start);
    }
    if (query.end) {
        builtQueries += builtParams.length > 0 ? ' AND ' : ' ';
        builtQueries += 'delivered_at <= ?'
        builtParams.push(query.end);
    }
    return {
        query: builtQueries + (builtParams.length > 1 ? ' ALLOW FILTERING' : ''),
        params: builtParams
    }
}
/**
 * Operations on /kafka/collection-handler
 */
module.exports = {
    /**
     * summary: [Public] Connector exposed method.
     * description: Record a message into database.
     * parameters: messageOwners, messageObject, referenceId, tags
     * produces: application/json
     * responses: callback(error, response)
     * operationId: createMessage
     */
    createMessage: function (messageOwners, messageObject, referenceId, tags, callback) {
        let messageId = Guid.raw();
        let messageStatus = 'CREATED';
        let messageCreatedAt = new Date().toISOString();
        let messageTags = tags ? tags: [];
        let owners = Array.isArray(messageOwners) ? messageOwners : [messageOwners];
        const client = new cassandra.Client({ contactPoints: cassandraContactPoints, keyspace: cassandraKeyspaceName });
        const query = 'INSERT INTO ' + cassandraTrackingTable + ' (id, status, tags, owners, object, reference_id, created_at, delivered_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        messageTags.push('provider:' + process.env.MESSAGE_SERVICE_PROVIDER);
        const params = [messageId, messageStatus, messageTags, owners, messageObject, referenceId, messageCreatedAt, null];
        client.execute(query, params, { prepare: true }, (err, data) => {
            if (!err) {
                callback(null, {
                    message_id: messageId,
                    reference_id: referenceId,
                    status: messageStatus
                });
                log.debug(data);
            } else {
                callback({
                    'code': 'error-execute-cassandra',
                    'message': 'CASSANDRA:' + err.message.toString()
                });
                log.error(err);
            }
        });
    },
    /**
     * summary: [Public] Connector exposed method.
     * description: Update a message status in database.
     * parameters: messageStatus, messageId, referenceId
     * produces: application/json
     * responses: callback(error, response)
     * operationId: updateMessage
     */
    updateMessage: function (messageStatus, messageId, referenceId, callback) {
        let messageUpdatedAt = new Date().toISOString();
        const client = new cassandra.Client({ contactPoints: cassandraContactPoints, keyspace: cassandraKeyspaceName });
        const query = 'UPDATE ' + cassandraTrackingTable + ' SET status=?, delivered_at=? WHERE id=? AND reference_id=?';
        const params = [messageStatus, messageUpdatedAt, messageId, referenceId];
        client.execute(query, params, { prepare: true }, (err, data) => {
            if (!err) {
                callback && callback(null, {
                    message_id: messageId,
                    reference_id: referenceId,
                    status: messageStatus
                });
                log.debug(data);
            } else {
                callback && callback({
                    'code': 'error-execute-cassandra',
                    'message': 'CASSANDRA:' + err.message.toString()
                });
                log.error(err);
            }
        });
    },
    /**
     * summary: [Public] Connector exposed method.
     * description: Get a message by Id in database.
     * parameters: messageId, referenceId
     * produces: application/json
     * responses: callback(error, response)
     * operationId: getMessageById
     */
    getMessageById: function (messageId, referenceId, callback) {
        let messageUpdatedAt = new Date().toISOString();
        const client = new cassandra.Client({ contactPoints: cassandraContactPoints, keyspace: cassandraKeyspaceName });
        const query = 'SELECT id, status, tags, owners, object, reference_id, created_at, delivered_at FROM ' + cassandraTrackingTable + ' WHERE id=? AND reference_id=?';
        const params = [messageId, referenceId];
        client.execute(query, params, { prepare: true }, (err, data) => {
            if (!err) {
                callback && callback(null, data);
                log.debug(data);
            } else {
                callback && callback({
                    'code': 'error-execute-cassandra',
                    'message': 'CASSANDRA:' + err.message.toString()
                });
                log.error(err);
            }
        });
    },
    /**
     * summary: [Public] Connector exposed method.
     * description: Get a message by Id in database.
     * parameters: messageId, referenceId
     * produces: application/json
     * responses: callback(error, response)
     * operationId: getMessageByParams
     */
    getMessageByParams: function (query, callback) {
        let messageUpdatedAt = new Date().toISOString();
        let builtResult = buildQueriesFromParams(query);
        log.debug('getMessageByParams:', builtResult);
        const client = new cassandra.Client({ contactPoints: cassandraContactPoints, keyspace: cassandraKeyspaceName });
        client.execute(builtResult.query, builtResult.params, { prepare: true }, (err, data) => {
            if (!err) {
                callback && callback(null, data);
                log.debug(data);
            } else {
                callback && callback({
                    'code': 'error-execute-cassandra',
                    'message': 'CASSANDRA:' + err.message.toString()
                });
                log.error(err);
            }
        });
    }
};
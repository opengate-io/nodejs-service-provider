'use strict';
var Mockgen = require('../mockgen.js');
/**
 * Operations on /messages/{id}
 */
module.exports = {
    /**
     * summary: 
     * description: Get the status of a sending message by message_id.
     * parameters: id, reference_id
     * produces: application/json
     * responses: 200, default
     * operationId: getMessageById
     */
    get: {
        200: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            Mockgen().responses({
                path: '/messages/{id}',
                operation: 'get',
                response: '200'
            }, callback);
        },
        default: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            Mockgen().responses({
                path: '/messages/{id}',
                operation: 'get',
                response: 'default'
            }, callback);
        }
    },
    /**
     * summary: 
     * description: Rollback a text message to sending queue again.
     * parameters: id, body
     * produces: application/json
     * responses: 200, default
     * operationId: rollbackMessageById
     */
    put: {
        200: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            Mockgen().responses({
                path: '/messages/{id}',
                operation: 'put',
                response: '200'
            }, callback);
        },
        default: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            Mockgen().responses({
                path: '/messages/{id}',
                operation: 'put',
                response: 'default'
            }, callback);
        }
    }
};

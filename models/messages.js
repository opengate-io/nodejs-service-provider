'use strict';
var Mockgen = require('./mockgen.js');
/**
 * Operations on /messages
 */
module.exports = {
    /**
     * summary: 
     * description: Get the list of sending messages by multiple params.
     * parameters: status, link, tag, start, end
     * produces: application/json
     * responses: 200, default
     * operationId: getMessageByParams
     */
    get: {
        200: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            Mockgen().responses({
                path: '/messages',
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
                path: '/messages',
                operation: 'get',
                response: 'default'
            }, callback);
        }
    },
    /**
     * summary: 
     * description: Request to send a message for doing something.
     * parameters: body
     * produces: application/json
     * responses: 200, default
     * operationId: sendServiceMessage
     */
    post: {
        200: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            Mockgen().responses({
                path: '/messages',
                operation: 'post',
                response: '200'
            }, callback);
        },
        default: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            Mockgen().responses({
                path: '/messages',
                operation: 'post',
                response: 'default'
            }, callback);
        }
    }
};

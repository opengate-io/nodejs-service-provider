'use strict';
var dataProvider = require('../../models/messages/{id}.js');
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
     */
    get: function getMessageById(req, res, next) {
        /**
         * Get the data for response 200
         * For response `default` status 200 is used.
         */
        var status = 200;
        var provider = dataProvider['get']['200'];
        provider(req, res, function (err, data) {
            if (err) {
                next(err);
                return;
            }
            res.status(status).send(data && data.responses);
        });
    },
    /**
     * summary: 
     * description: Rollback a text message to sending queue again.
     * parameters: id, body
     * produces: application/json
     * responses: 200, default
     */
    put: function rollbackMessageById(req, res, next) {
        /**
         * Get the data for response 200
         * For response `default` status 200 is used.
         */
        var status = 200;
        var provider = dataProvider['put']['200'];
        provider(req, res, function (err, data) {
            if (err) {
                next(err);
                return;
            }
            res.status(status).send(data && data.responses);
        });
    }
};

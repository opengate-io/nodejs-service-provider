'use strict';
var sendmail = require('sendmail')({ silent: true });
var sanitizeHtml = require('sanitize-html');
var Log = require('timestamp-log');
var log = new Log(process.env.LOG_LEVEL);
/**
 * Operations on /kafka/collection-handler
 */
module.exports = {
    /**
     * summary: [Public] REST API exposed method.
     * description: Send an SMS to destinations.
     * parameters: destinations, message
     * produces: application/json
     * responses: 200, default
     * operationId: deliverMessage
     */
    deliverMessage: function (message, callback) {
        if (typeof (message) === 'string') {
            callback(null, {
                content: {
                    message: message
                },
                provider: 'DEBUG'
            });
        } else {
            callback({
                error: 'error-unsupported-type',
                message: 'Unsupported parameter type'
            });
        }
    }
};
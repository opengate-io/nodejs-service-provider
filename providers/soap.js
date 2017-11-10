'use strict';
var loopback = require('loopback');
var dateFormat = require('dateformat');
var Log = require('timestamp-log');
var log = new Log(process.env.LOG_LEVEL);
/**
 * summary: [Private] Internal used method only
 * description: perform a Service Request.
 * parameters: message
 * produces: application/json
 * responses: 200, default
 * operationId: performServiceRequest
*/
var performServiceRequest = function (message, callback) {
    /**
     * Using mock data generator module.
     * Replace this by actual data for the api.
     */
    var ds = loopback.createDataSource('soap', {
        connector: require('loopback-connector-soap'),
        wsdl: process.env.SOAP_SERVICE_URL,
        operations: {
            performRequest: {
                service: 'ServiceName', // The WSDL service name
                port: 'PortName', // The WSDL port name
                operation: 'OperationName' // The WSDL operation name
            },
        }
    });
    // Unfortunately, the methods from the connector are mixed in asynchronously
    // This is a hack to wait for the methods to be injected
    ds.once('connected', function () {
        var soapBodyToRequest = {
            // SOAP body in JSON here
        };
        ds.createModel('ServiceName', {}).performRequest(soapBodyToRequest, function (err, response) {
            if (!err) {
                callback(null, responses);
            } else {
                callback({
                    error: 'error-service-provider',
                    message: 'Error Message Details'
                });
                log.error(response);
            }
        });
    });
}
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
        if (typeof (message) === 'Object') {
            performServiceRequest(message, callback);
        } else {
            callback({
                error: 'error-unsupported-type',
                message: 'Unsupported parameter type'
            });
        }
    }
};
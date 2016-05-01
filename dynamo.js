/* global require, module, process */
var AWS = require("aws-sdk");
var moment = require('moment');
var q = require('q');

AWS.config.update({
	region: "us-west-2",
	endpoint: process.env.DYNAMO_URL
});

var dynamoLib = {};

var docClient = new AWS.DynamoDB.DocumentClient();
var _table = 'car-info';
var _car_name = 'Gypsy-Danger';

dynamoLib.buildRangeQueryParams = function(table, type, from, to) {
	return {
		TableName : table,
		ProjectionExpression:"#type, #time, odometer, gallons, #f",
		KeyConditionExpression: "#type = :type and #time between :date1 and :date2",
		ExpressionAttributeNames:{
			"#type": "transaction_type",
			"#time": 'timestamp',
			"#f": 'full'
		},
		ExpressionAttributeValues: {
			":type": type,
			":date1": from,
			":date2": to
		}
	};
};

dynamoLib.queryRange = function(tableName, type, from, to) {
	var deferred = q.defer();
	docClient.query(dynamoLib.buildRangeQueryParams(tableName, type, from, to), function(err, data) {
		if (err) {
			deferred.reject("Unable to query. Error:" + JSON.stringify(err, null, 2));
		} else {
			deferred.resolve(data.Items);
		}
	});
	return deferred.promise;
};

dynamoLib.queryRecent = function(tableName, type) {
	var deferred = q.defer();
	docClient.query({
		TableName: tableName,
		KeyConditionExpression: '#hash = :hkey and #range > :rkey',
		ExpressionAttributeNames: {
			'#hash': 'transaction_type',
			'#range': 'timestamp'
		},
		ExpressionAttributeValues: {
			':hkey': type,
			':rkey': moment().subtract(2, 'months').toISOString()
		}
	}, function(err, data) {
		if (err) {
			deferred.reject("Unable to query. Error:" + JSON.stringify(err, null, 2));
		} else {
			deferred.resolve(data.Items);
		}
	});
	return deferred.promise;
};

dynamoLib.queryAll = function(tableName, type) {
	var deferred = q.defer();
	docClient.scan({
		TableName: tableName,
		FilterExpression: 'transaction_type = :type',
		ExpressionAttributeValues: {
			':type': type
		}
	}, function(err, data) {
		if (err) {
			deferred.reject("Unable to query. Error:" + JSON.stringify(err, null, 2));
		} else {
			deferred.resolve(data.Items);
		}
	});
	return deferred.promise;
};

dynamoLib.put = function(params) {
	var deferred = q.defer();
	if(!params.TableName) { params.TableName = _table; }
	if(!params.Item.car_name) { params.Item.car_name = _car_name; }
	docClient.put(params, function(err, data) {
		if (err) {
			deferred.reject("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			deferred.resolve("Added item:", JSON.stringify(data, null, 2));
		}
	});
	return deferred.promise;
};

module.exports = dynamoLib;

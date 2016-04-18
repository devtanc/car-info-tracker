/* global require, process, __dirname */
require('config-envy')({
	env: process.env.NODE_ENV  || 'development',
	cwd: process.cwd(),
	localEnv: '.env',
	overrideProcess: false,
	silent: false
});
require('winston-loggly');

var express = require('express');
var request = require('request');
var app = express();
var bodyParser = require('body-parser');
var logger = require("./logger.js");
var dynamo = require("./dynamo.js");
logger.debug('Running in ' + (process.env.NODE_ENV || 'development') + ' mode');
logger.debug('Dynamo URL: ' + process.env.DYNAMO_URL);

var PORT_NUMBER = process.env.PORT_NUMBER || 3030;

app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/public'));

app.get('/', function(req,res) {
	res.sendFile('index.html');
});


//API endpoints
var couchConfig = {
	baseUrl: 'http://' + process.env.DB_IP + ':' + process.env.DB_PORT + '/',
	db: 'car_info'
};

app.post('/api/get', function(req, res) { //Gets item from db
	//Parse queryParams into query parameters on the url
	var builtUri = couchConfig.db + '/_design/_views/_view/' + req.body.view;
	if (req.body.queryParams) {
		builtUri += '?';
		var paramArray = Object.keys(req.body.queryParams);
		paramArray.forEach(function(element, index) {
			builtUri += element + '=' + req.body.queryParams[element];
			if (index != paramArray.length - 1) {
				builtUri += '&';
			}
		});
	}
	logger.log('info', 'GET request redirected to: [' + couchConfig.baseUrl + builtUri + ']');
	//Send GET request with constructed URL
	request.get({
		baseUrl: couchConfig.baseUrl,
		uri: builtUri,
		json: true
	}, function(err, response, body) {
		if (err) { logger.error(err); }
		else {
			res.status(200).json(body).end(); //Return JSON received from DB
		}
	});
});

app.get('/api/dynamo/get/recent', function(req, res) {
	logger.log('info', '[dynamo] GET request - recent');
	dynamo.queryRecent('car-info', 'fuel').then(function(data) {
		res.status(200).json(data).end();
	}).catch(function(err) {
		logger.error(err);
	});
});

app.get('/api/dynamo/get/all', function(req, res) {
	logger.log('info', '[dynamo] GET request - all');
	dynamo.queryAll('car-info', 'fuel').then(function(data) {
		res.status(200).json(data).end();
	}).catch(function(err) {
		logger.error(err);
	});
});

app.put('/api', function(req, res) { //Modifies items in couchdb
	logger.log('info', 'PUT request: [BASEURL/DB/' + req.body._id + ']');
	request.put({
		baseUrl: couchConfig.baseUrl,
		uri: couchConfig.db + '/' + req.body._id,
		body: req.body,
		json: true
	}, function(err, response, body) {
		if (err) { logger.error(err); }
		else {
			res.status(200).json(body).end();
		}
	});
});

app.post('/api', function(req, res) { //Creates new items in couchdb
	logger.info('POST request: [' + JSON.stringify(req.body) + ']');
	request.post({
		baseUrl: couchConfig.baseUrl,
		uri: couchConfig.db,
		body: req.body,
		json: true
	}, function(err, response, body) {
		if (err) { logger.error(err); }
		else {
			res.status(200).json(body).end();
		}
	});
});

app.post('/api/dynamo', function(req, res) { //Creates new items in couchdb
	logger.info('[dynamo] POST request: [' + JSON.stringify(req.body) + ']');
	dynamo.put({
		TableName: 'car-info',
		Item: req.body
	}).then(function(data) {
		res.status(200).json(data).end();
	}).catch(function(err) {
		logger.error(err);
	});
});

app.delete('/api', function(req, res) {
	logger.info('DELETE request: [BASEURL/DB/' + req.body._id + "?rev=" + req.body._rev + ']');
	request.delete({
		baseUrl: couchConfig.baseUrl,
		uri: couchConfig.db + "/" + req.body._id + "?rev=" + req.body._rev,
		json: true
	}, function(err, response, body) {
		if (err) { logger.error(err); }
		else {
			res.status(200).json(body);
		}
	});
});

app.listen(PORT_NUMBER, function() {
	logger.info('Listening on port: ' + PORT_NUMBER);
});

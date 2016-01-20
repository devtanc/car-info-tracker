/* global require, process, __dirname */
var express = require('express');
var request = require('request');
var app = express();
var bodyParser = require('body-parser');

//Process command line flags for server
if (process.argv.length < 3 && (process.env.DB_IP == undefined || process.env.DB_PORT == undefined)) {
	throw 'Flags Missing! Be sure to include -dbp with database port and -dbip with database ip address';
}
var args = process.argv.slice(2);
args.forEach(function(element, index, array) {
	if (element.indexOf('-') === 0) {
		switch(element.indexOf('--') === 0 ? element.slice(2) : element.slice(1)) {
			case 'server-port':
			case 'p':
				var port = parseInt(array[index + 1]);
				if (port > 0 && port <= 65536) {
					process.env.PORT_NUMBER = port;
				} else {
					throw 'Invalid port number supplied for server';
				}
				break;
			case 'db-port':
			case 'dbp':
				var port = parseInt(array[index + 1]);
				if (port > 0 && port <= 65536) {
					process.env.DB_PORT = port;
				} else {
					throw 'Invalid port number supplied for database';
				}
				break;
			case 'db-ip':
			case 'dbip':
				var ip = array[index + 1];
				if (/([0-9]{1,3}\.){3}[0-9]{1,3}/.test(ip)) {
					process.env.DB_IP = ip;
				} else {
					throw 'Invalid ip address supplied for database';
				}
				break;
			default:
				break;
		}
	}
});

if (process.env.DB_IP == undefined || process.env.DB_PORT == undefined) {
	throw 'Flags Missing! Be sure to include -dbp with database port and -dbip with database ip address';
}
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
	console.log('API GET request received');
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
	console.log(builtUri);
	//Send GET request with constructed URL
	request.get({
		baseUrl: couchConfig.baseUrl,
		uri: builtUri,
		json: true
	}, function(err, response, body) {
		if (err) { console.log(err); }
		else {
			console.log(body);
			res.status(200).json(body).end(); //Return JSON received from DB
		}
	});
});

app.put('/api', function(req, res) { //Modifies items in couchdb
	console.log('API PUT request received');
	request.put({
		baseUrl: couchConfig.baseUrl,
		uri: couchConfig.db + '/' + req.body._id,
		body: req.body,
		json: true
	}, function(err, response, body) {
		if (err) { console.log(err); }
		else {
			console.log(body);
			res.status(200).end('Received doc');
		}
	});
});

app.post('/api', function(req, res) { //Creates new items in couchdb
	console.log('API POST request received');
	request.post({
		baseUrl: couchConfig.baseUrl,
		uri: couchConfig.db,
		body: req.body,
		json: true
	}, function(err, response, body) {
		if (err) { console.log(err); }
		else {
			console.log(body);
			res.status(200).end('Received doc');
		}
	});
});

app.delete('/api', function(req, res) {
	console.log('API DELETE request received');
	request.delete({
		baseUrl: couchConfig.baseUrl,
		uri: couchConfig.db + "/" + req.body._id + "?rev=" + req.body._rev,
		json: true
	}, function(err, response, body) {
		if (err) { console.log(err); }
		else {
			console.log(body);
			res.status(200).end('Received doc');
		}
	});
});

app.post('/api/4DJ9hxk4jnIGQQpH8V4i', function(req, res) {
	console.log(req.body);
	res.status(200).end();
});

app.listen(PORT_NUMBER, function() {
	console.log('Listening on port: ' + PORT_NUMBER);
});

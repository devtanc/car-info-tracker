var express = require('express');
var app = express();
var PORT_NUMBER = 3000;

app.use('/', express.static(__dirname + '/public'));

app.get('/', function(req,res) {
	res.sendFile('index.html');
});

app.listen(PORT_NUMBER, function() {
	console.log('Listening on port: ' + PORT_NUMBER);
});

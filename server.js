var express = require('express');
var app = express();

var args = process.argv.slice(2);
args.forEach(function(element, index, array) {
	if (element.indexOf('-') === 0) {
		switch(element.indexOf('--') === 0 ? element.slice(2) : element.slice(1)) {
			case 'port':
			case 'p':
				var port = parseInt(array[index + 1]);
				if (port > 1025 && port <= 65536) process.env.PORT_NUMBER = port;
				break;
			default:
				break;
		}
	}
});

var PORT_NUMBER = process.env.PORT_NUMBER || 3030;

app.use('/', express.static(__dirname + '/public'));

app.get('/', function(req,res) {
	res.sendFile('index.html');
});

app.listen(PORT_NUMBER, function() {
	console.log('Listening on port: ' + PORT_NUMBER);
});

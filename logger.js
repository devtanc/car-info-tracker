/* global require, module, process */
var winston = require('winston');
require('winston-loggly');

winston.addColors({
	info: 'blue',
	warn: 'yellow',
	error: 'red'
});

module.exports = new (winston.Logger)({
	transports: [
			new (winston.transports.Console)({
				name: 'Console',
				level: 'silly',
				colorize:'all'
			}),
			new (winston.transports.Loggly)({
				name: 'Loggly',
				level: 'info',
				token: process.env.LOGGLY_TOKEN,
				subdomain: process.env.LOGGLY_SUBDOMAIN,
				tags: ["car-info-tracker", "server", process.env.LOGGLY_ENV_TAG],
				json:true
			})
		]
});


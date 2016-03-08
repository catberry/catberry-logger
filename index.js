'use strict';

const Logger = require('./lib/Logger');

module.exports = {
	register(locator) {
		const logger = new Logger(locator);
		locator.registerInstance('logger', logger);
	},
	Logger
};

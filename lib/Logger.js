'use strict';

const chalk = require('chalk');
const LoggerBase = require('./LoggerBase');
const prettyHrTime = require('pretty-hrtime');

const LOG_LEVELS = {
	60: 'FATAL',
	50: 'ERROR',
	40: 'WARN ',
	30: 'INFO ',
	20: 'DEBUG',
	10: 'TRACE'
};

const LEVEL_STYLES = {
	60: ['white', 'bgRed', 'bold'],
	50: ['white', 'bgRed'],
	40: ['black', 'bgYellow'],
	30: ['black', 'bgCyan'],
	20: ['black', 'bgWhite'],
	10: ['grey', 'bgBlack']
};

class Logger extends LoggerBase {

	/**
	 * Creates a new instance of the server-side console logger.
	 * @param  {ServiceLocator} locator Locator for resolving dependencies.
	 */
	constructor(locator) {
		super(locator);

		/**
		 * Current process' ID
		 * @type {number}
		 */
		this._pid = process.pid;

		/**
		 * Current styling functions for each level.
		 * @type {Object}
		 * @private
		 */
		this._cachedStyling = this._getStylings();
	}

	/**
	 * Writes a log message.
	 * @param  {number} level   The log level.
	 * @param  {string|Error} message Message to write.
	 */
	write(level, message) {
		if (level < this._level) {
			return;
		}

		try {
			const prefix = this._buildPrefix(level);

			var formattedMessage, writeStream;

			if (level > 40) {
				const errorMessage = message instanceof Error ? `${message.stack}\n\n` : message;
				formattedMessage = `${prefix} – ${errorMessage}`;
				writeStream = process.stderr;
			} else {
				formattedMessage = `${prefix} – ${message}\n`;
				writeStream = process.stdout;
			}

			writeStream.write(formattedMessage);

		} catch (e) {

			/* eslint no-console: 0 */
			console.error(e.stack);
		}
	}

	/**
	 * Wraps the event bus with log messages.
	 * @param  {EventEmitter} eventBus The event bus to wrap.
	 */
	wrapEventBus(eventBus) {
		super.wrapEventBus(eventBus);

		process.on('uncaughtException', error => this.fatal(error));

		if (this._level > 30) {
			return;
		}

		eventBus
			.on('storeFound', args => this.info(`Store "${args.name}" found at ${args.path}`))
			.on('componentFound', args => this.info(`Component "${args.name}" found at ${args.path}`))
			.on('appDefinitionsBuilt', args => {
				const timeMessage = prettyHrTime(args.hrTime);
				this.info(`App definitions have been built (${timeMessage})`);
			})
			.on('appBundleBuilt', args => {
				const timeMessage = prettyHrTime(args.hrTime);
				this.info(`Browser app bundle has been built at ${args.path} (${timeMessage})`);
			})
			.on('externalsBundleBuilt', args => {
				const timeMessage = prettyHrTime(args.hrTime);
				this.info(`Browser externals bundle has been built at ${args.path} (${timeMessage})`);
			})

			.on('appBundleChanged', args => {
				this.info(`App bundle has been updated, changed files: [${args.changedFiles.join(',')}]`);
			});
	}

	/**
	 * Builds a prefix for the message object.
	 * @param {number} level The level of the message.
	 * @returns {string} The prefix string for the message.
	 * @private
	 */
	_buildPrefix(level) {
		return this._cachedStyling[level](
			`[${(new Date()).toISOString()}] [${LOG_LEVELS[level]}] [${this._name}:${this._pid}]`
		);
	}

	/**
	 * Gets a styling function for the specified level.
	 * @returns {Object} Styling functions for every level.
	 * @private
	 */
	_getStylings() {
		const stylings = Object.create(null);
		Object.keys(LEVEL_STYLES)
			.forEach(level => {
				let styling = chalk;
				for (let i = 0; i < LEVEL_STYLES[level].length; i++) {
					styling = styling[LEVEL_STYLES[level][i]];
				}
				stylings[level] = styling;
			});

		return stylings;
	}
}

module.exports = Logger;

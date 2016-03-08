'use strict';

const LoggerBase = require('../lib/LoggerBase');

class Logger extends LoggerBase {

	/**
	 * Writes a log message.
	 * @param  {number} level   The log level.
	 * @param  {string|Error} message Message to write.
	 */
	/* eslint no-console: 0 */
	write(level, message) {
		if (level < this._level) {
			return;
		}

		if (level >= 50) {
			const errorMessage = message instanceof Error ?
				`${message.name}: ${message.message}\n${message.stack}` :
				message;
			console.error(errorMessage);
		} else if (level >= 40) {
			console.warn(message);
		} else if (level >= 30) {
			console.info(message);
		} else {
			console.log(message);
		}
	}

	/**
	 * Wraps the event bus with log messages.
	 * @param  {EventEmitter} eventBus The event bus to wrap.
	 */
	wrapEventBus(eventBus) {
		super.wrapEventBus(eventBus);

		const window = this._locator.resolve('window');

		window.onerror = (msg, uri, line) => {
			this.fatal(`${uri}:${line} ${msg}`);
			return true;
		};

		if (this._level > 20) {
			return;
		}

		eventBus
			.on('documentUpdated', args =>
				this.debug(`Document updated (${args.length} store(s) changed)`))
			.on('componentBound', args => {
				const id = args.id ? `#${args.id}` : '';
				this.debug(`Component "${args.element.tagName}${id}" is bound`);
			})
			.on('componentUnbound', args => {
				const id = args.id ? `#${args.id}` : '';
				this.debug(`Component "${args.element.tagName}${id}" is unbound`);
			});
	}
}

module.exports = Logger;

'use strict';

const DEFAULT_LEVEL = 30;
const DEFAULT_NAME = 'catberry';

const prettyHrTime = require('pretty-hrtime');

class LoggerBase {

	/**
	 * Create a new instance of the basic this.
	 * @param  {ServiceLocator} locator Locator for resolving dependencies.
	 */
	constructor(locator) {
		const config = locator.resolve('config').logger || {};

		/**
		 * Current Service Locator.
		 * @type {ServiceLocator}
		 * @protected
		 */
		this._locator = locator;

		/**
		 * Current logging level.
		 * @type {number}
		 * @protected
		 */
		this._level = typeof (config.level) === 'number' ? config.level : DEFAULT_LEVEL;

		/**
		 * Current logger name.
		 * @type {string}
		 * @protected
		 */
		this._name = typeof (config.name) === 'string' ? config.name : DEFAULT_NAME;

		const eventBus = locator.resolve('eventBus');
		this.wrapEventBus(eventBus);
	}

	/**
	 * Logs a trace message.
	 * @param {string} message The message to write.
	 */
	trace(message) {
		this.write(10, message);
	}

	/**
	 * Logs a debug message.
	 * @param {string} message The message to write.
	 */
	debug(message) {
		this.write(20, message);
	}

	/**
	 * Logs an info message.
	 * @param {string} message The message to write.
	 */
	info(message) {
		this.write(30, message);
	}

	/**
	 * Logs a warning message.
	 * @param {string} message The message to write.
	 */
	warn(message) {
		this.write(40, message);
	}

	/**
	 * Logs an error message.
	 * @param {string|Error} message The message to write.
	 */
	error(message) {
		this.write(50, message);
	}

	/**
	 * Logs a fatal error message.
	 * @param {string|Error} message The message to write.
	 */
	fatal(message) {
		this.write(60, message);
	}

	/**
	 * Wraps the event bus with log messages.
	 * @param  {EventEmitter} eventBus The event bus to wrap.
	 */
	wrapEventBus(eventBus) {
		if (this._level > 50) {
			return;
		}
		eventBus.on('error', error => this.error(error));

		if (this._level > 40) {
			return;
		}
		eventBus.on('warn', msg => this.warn(msg));

		if (this._level > 30) {
			return;
		}

		eventBus
			.on('info', msg => this.info(msg))
			.on('componentLoaded', args => this.info(`Component "${args.name}" loaded`))
			.on('storeLoaded', args => this.info(`Store "${args.name}" loaded`))
			.on('allStoresLoaded', () => this.info('All stores loaded'))
			.on('allComponentsLoaded', () => this.info('All components loaded'));

		if (this._level > 20) {
			return;
		}

		eventBus
			.on('debug', msg => this.debug(msg))
			.on('componentRender', args => {
				const id = getId(args.context);
				const tagName = getTagNameForComponentName(args.name);
				this.debug(`Component "${tagName}${id}" is being rendered...`);
			})
			.on('componentRendered', args => {
				const id = getId(args.context);
				const tagName = getTagNameForComponentName(args.name);
				const time = Array.isArray(args.hrTime) ?
					` (${prettyHrTime(args.hrTime)})` : '';
				this.debug(`Component "${tagName}${id}" rendered${time}`);
			})
			.on('documentRendered',
				args => this.debug(`Document rendered for URI ${args.location.toString()}`));

		if (this._level > 10) {
			return;
		}

		eventBus.on('trace', msg => this.trace(msg));
	}
}

/**
 * Gets an ID for logging component-related messages.
 * @param  {Object} context The component's context.
 * @return {string} the ID of the element starting with '#'.
 */
function getId(context) {
	const id = context.attributes.id;
	return id ? `#${id}` : '';
}

/**
 * Gets a tag name for a component.
 * @param  {string} componentName The name of the component.
 * @return {string} The tag name of the component.
 */
function getTagNameForComponentName(componentName) {
	if (typeof (componentName) !== 'string') {
		return '';
	}
	const upperComponentName = componentName.toUpperCase();
	if (componentName === 'HEAD') {
		return upperComponentName;
	}
	if (componentName === 'DOCUMENT') {
		return 'HTML';
	}
	return `CAT-${upperComponentName}`;
}

module.exports = LoggerBase;

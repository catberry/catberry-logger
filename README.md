# Console logger for the Catberry Framework

[![Build Status](https://travis-ci.org/catberry/catberry-logger.svg?branch=master)](https://travis-ci.org/catberry/catberry-logger)

## Description

This is a simple console logger for the Catberry Framework. It does not have any feature except logging to the console.

## Configuration

The logger has a very simple configuration. You can pass the `logger` section in the config object:

```javascript
const cat = catberry.create({
	logger: {
		name: 'catberry' // name in the console ("catberry" by default),
		level: 30 // minimal logging level (30 by default)
	}
});
```

The logger levels:

- "fatal" (60) – Fatal error occurs, the application probably fails.
- "error" (50) – Regular error message.
- "warn" (40) – Something went wrong/not as expected.
- "info" (30) – Application tells details about the work it does.
- "debug" (20) – Any information useful for debugging.
- "trace" (10) – Any other detailed messages about the application status. The most detailed level.

## Usage

```javascript
// register it into the locator

const cat = catberry.create();
const logger = require('catberry-logger');

logger.register(cat.locator);
// since this moment Catberry writes all its log messages to the console
```

Also, you can use the logger wherever you want resolving it from the locator:
```javascript
class Component {
	constructor(locator) {
		const logger = locator.resolve('logger');
		logger.info('The coolest component has been created!');
	}
}
```

## Contributing

There are a lot of ways to contribute:

* Give it a star
* Join the [Gitter](https://gitter.im/catberry/main) room and leave a feedback or help with answering users' questions
* [Submit a bug or a feature request](https://github.com/catberry/catberry-locator/issues)
* [Submit a PR](https://github.com/catberry/catberry-locator/blob/develop/CONTRIBUTING.md)

Denis Rechkunov <denis@rdner.de>

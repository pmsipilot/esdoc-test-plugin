# ESDoc Documentation Test Plugin

This plugin will convert any Javascript snippet inside descriptions into executable test.

Writing a good documentation often requires to write good examples. Keeping these examples in sync with the actual code
is hard when you don't check them. With this plugin, ESDoc will turn any snippet into executable tests and run them each
time you build the doc.

## Installation

```
npm install --save esdoc esdoc-test-plugin
```

## Configuration

To enable the plugin, update tour `.esdoc.json` configuration file:

```json
{
    "source": "./src",
    "destination": "./public",
    "plugin": [
        {
            "name": "./esdoc-test-plugin",
            "option": {
                "path": "./src"
            }
        }
    ]
}
```

Here is the complete list of configuration options:

| Name              | Type      | Default | Annotation | Description                                                                                                     |
|-------------------|-----------|---------|------------|-----------------------------------------------------------------------------------------------------------------|
| `path`            | `String`  |         | ✓          | The base path to the source directory. Might be the same as the `source` directive of ESDoc.                    |
| `exitOnFailure`   | `Boolean` | `false` |            | Should ESDoc exit immediately if a test failed.                                                                 |
| `exitWithFailure` | `Boolean` | `true`  |            | Should ESDoc exit with an error status if a test failed.                                                        |
| `assert`          | `String`  | `node`  | ✓          | Which assertion framework to use (one of: `chai`, `chai-expect`, `chai-assert`, `expect`, `expect.js`, `node`). |

## Usage

Given you have the following Javascript code and its documentation:

~~~js
/**
* @param {Number} x
* @param {Number} y
* 
* @return {Number}
*/
const add = (x, y) => x + y;
~~~

You can add some test in the description:

~~~js
/**
 * This function adds two numbers:
 * 
 * ```js
 * const add = require('./add');
 * 
 * assert.equal(add(1, 2), 3);
 * ```
 * 
 * @param {Number} x
 * @param {Number} y
 * 
 * @return {Number}
 */
const add = (x, y) => x + y;
~~~

This will generate a single test for the `add` function. 

_Note that the `require` is relative to the `plugin.option.path` configuration directive (the actual file is located 
at `./src/add.js`)._

You can add more test by writing more snippets:

~~~js
/**
 * This function adds two numbers:
 * 
 * ```js
 * const add = require('./add');
 * 
 * assert.equal(add(1, 2), 3);
 * ```
 *
 * ```js
 * const add = require('./add');
 * 
 * assert.equal(add(-1, -2), -3);
 * ```
 * 
 * @param {Number} x
 * @param {Number} y
 * 
 * @return {Number}
 */
const add = (x, y) => x + y;
~~~

You can also use annotation to configure some tests:

~~~js#assert=chai
/**
 * This function adds two numbers:
 * 
 * ```js
 * const add = require('./add');
 * 
 * add(1, 2).should.equal(3);
 * ```
 * 
 * @param {Number} x
 * @param {Number} y
 * 
 * @return {Number}
 */
const add = (x, y) => x + y;
~~~

Annotation are written next to the language with the following format: `js[[#name[=value]]...]`. If the annotation has no
value, it's default value will be `true`.

The `path` and `assert` configuration directives can be overridden at the test level using annotations. You can also use
the `skip` annotation to mark a test as skipped.

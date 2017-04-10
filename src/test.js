/** @private */
const path = require('path');
/** @private */
const vm = require('vm');

/**
 * Test class.
 *
 * Stores information about a test and its code.
 */
class Test {
    /**
     * @param {String} file
     * @param {String} item
     * @param {Number} line
     * @param {String} code
     * @param {Object} config
     * @param {Object} options
     */
    constructor(file, item, line, code, config, options) {
        /** @private */
        this.file = file;
        /** @private */
        this.item = item;
        /** @private */
        this.line = line;
        /** @private */
        this.code = code;
        /** @private */
        this.config = config || {};
        /** @private */
        this.options = options || {};

        Object.freeze(this);
        Object.seal(this);
    }

    /**
     * @return {*|Error}
     */
    run() {
        return vm.runInThisContext(Test.template(this))((module) => {
            /* eslint-disable global-require, import/no-dynamic-require */
            if (module.match(/^\./)) {
                return require(path.join(path.resolve(this.options.path || this.config.path), path.dirname(this.file), module));
            }

            return require(module);
            /* eslint-enable global-require, import/no-dynamic-require */
        });
    }

    /**
     * Builds the executable test code.
     *
     * ```js
     * const Test = require('./test');
     * const test = new Test('file', 'item', 42, 'console.log(true);', { assert: 'node' }, {});
     *
     * Test.template(test).should.equal(`
     *             (require) => {
     *                 const assert = require(\'assert\');
     *
     *                 try {
     *                     console.log(true);
     *                 } catch (error) {
     *                     return error;
     *                 }
     *             };
     *         `);
     * ```
     *
     * @param {Test} test
     *
     * @returns {String}
     */
    static template(test) {
        let assert;

        switch (test.options.assert || test.config.assert) {
            case 'chai':
                assert = 'require(\'chai\').should();';
                break;

            case 'chai-expect':
                assert = 'const expect = require(\'chai\').expect;';
                break;

            case 'chai-assert':
                assert = 'const assert = require(\'chai\').assert;';
                break;

            case 'expect':
                assert = `const expect = require('expect');`;
                break;

            case 'expect.js':
                assert = `const expect = require('expect.js');`;
                break;

            case 'node':
                assert = 'const assert = require(\'assert\');';
                break;

            default:
                throw Error(`Unknown assertion framework: ${test.options.assert || test.config.assert}`);
        }

        return `
            (require) => {
                ${assert}

                try {
                    ${test.code}
                } catch (error) {
                    return error;
                }
            };
        `;
    }
}

module.exports = Test;

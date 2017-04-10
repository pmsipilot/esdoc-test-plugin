const path = require('path');
const vm = require('vm');

class Test {
    constructor(file, item, line, code, config, options) {
        this.file = file;
        this.item = item;
        this.line = line;
        this.code = code;
        this.config = config || {};
        this.options = options || {};

        Object.freeze(this);
        Object.seal(this);
    }

    run() {
        return vm.runInThisContext(Test.template(this.code, this.config, this.options))((module) => {
            /* eslint-disable global-require, import/no-dynamic-require */
            if (module.match(/^\./)) {
                return require(path.join(path.resolve(this.options.path || this.config.path), path.dirname(this.file), module));
            }

            return require(module);
            /* eslint-enable global-require, import/no-dynamic-require */
        });
    }

    static template(code, config, options) {
        let assert;

        switch (options.assert || config.assert) {
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
            case 'expect.js':
                assert = `const expect = require('${config.assert}');`;
                break;

            case 'node':
                assert = 'const assert = require(\'assert\');';
                break;

            default:
                throw Error(`Unknown assertion framework: ${config.assert}`);
        }

        return `
            (require) => {
                ${assert}
                
                try {
                    ${code}
                } catch (error) {
                    return error;
                }
            };
        `;
    }
}

module.exports = Test;

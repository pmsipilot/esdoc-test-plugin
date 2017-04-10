/**
 * Queue class.
 *
 * Stores every candidate test for later execution.
 */
class Queue {
    /**
     * Queue constructor.
     *
     * Builds a new Queue and make it frozen.
     */
    constructor() {
        /** @private */
        this.items = {};

        Object.freeze(this);
        Object.seal(this);
    }

    /**
     * Enqueues a test.
     *
     * ```js
     * const Queue = require('./queue');
     * const Test = require('./test');
     *
     * const queue = new Queue();
     * const test = new Test('file', 'item', 42, 'console.log(true)', {}, {});
     *
     * queue.push(test).should.equal(queue);
     * ```
     *
     * @param {Test} test
     *
     * @return {Queue}
     */
    push(test) {
        if (!this.items[test.file]) {
            this.items[test.file] = {};
        }

        if (!this.items[test.file][test.item]) {
            this.items[test.file][test.item] = {
                line: test.line,
                tests: []
            };
        }

        this.items[test.file][test.item].tests.push(test);

        return this;
    }

    /**
     * Runs all tests in the queue.
     *
     * ```js
     * const Queue = require('./queue');
     * const Test = require('./test');
     *
     * const queue = new Queue();
     * const file = 'some/file.js';
     * const item = 'some~item';
     * const line = 42;
     * const test = new Test(file, item, line, 'console.log(true)', {}, {});
     *
     * queue.push(test);
     *
     * queue.run(
     *     (f) => { f.should.equal(file); },
     *     (i, l, f) => {
     *         i.should.equal(item);
     *         l.should.equal(line);
     *         f.should.equal(file);
     *     },
     *     (t, i) => {
     *         t.should.equal(test);
     *         i.should.equal(0);
     *     }
     * );
     * ```
     *
     * @param {Function(file: String)} fileCb
     * @param {Function(item: String, line: Number, file: String)} itemCb
     * @param {Function(test: Test, index: Number)} testCb
     *
     * @return {Queue}
     */
    run(fileCb, itemCb, testCb) {
        Object.keys(this.items).forEach((file) => {
            fileCb(file);

            Object.keys(this.items[file]).forEach((item) => {
                itemCb(item, this.items[file][item].line, file);

                this.items[file][item].tests.forEach((test, index) => {
                    testCb(test, index);
                });
            });
        });
    }
}

module.exports = Queue;

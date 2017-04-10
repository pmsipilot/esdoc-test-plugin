class Queue {
    constructor() {
        this.items = {};

        Object.freeze(this);
        Object.seal(this);
    }

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

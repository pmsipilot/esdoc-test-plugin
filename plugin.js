const chalk = require('chalk');
const marked = require('marked');
const Test = require('./src/test');
const Queue = require('./src/queue');

let config;
let queue;
let score;

exports.onHandleTag = function(ev) {
    ev.data.tag
        .filter(tag => !!tag.description)
        .map(({ longname, lineNumber, description }) => {
            const renderer = new marked.Renderer();

            renderer.code = (code, level) => {
                const [ ,lang, options] = level.match(/(\w+)((?:#.+(?:=.*?)?)*)/);

                if (['js', 'javascript'].indexOf(lang.toLowerCase()) > -1) {
                    const parts = longname.split('~');
                    const [file, item] = parts;

                    queue.push(new Test(
                        file,
                        item,
                        lineNumber,
                        code,
                        config,
                        (options || '')
                            .split('#')
                            .filter(value => !!value)
                            .reduce((prev, value) => {
                                const parts = value.split('=');

                                return Object.assign({}, prev, { [parts[0]]: parts.length > 1 ? parts[1] : true });
                            }, {})
                    ));
                }
            };

            return { description, renderer };
        })
        .forEach(({ description, renderer }) => {
            marked(description, { renderer });
        });

    console.log('test: Running tests found in documentation');

    queue.run(
        (file) => { console.log(chalk.black(`  ${file}`)); },
        (item, line, file) => { console.log(`${chalk.black(`    ${item}`)} ${chalk.gray(`${file}:${line}`)}`); },
        (test, index) => {
            if (test.options.skip) {
                console.log(chalk.yellow(`      #${++index} - SKIPPED`));

                score.skipped = score.skipped + 1;
            } else {
                const result = test.run();

                if (result instanceof Error) {
                    console.log(chalk.red(`      #${++index} - ${result}`));

                    score.failure = score.failure + 1;
                } else {
                    console.log(chalk.green(`      #${++index} - OK`));

                    score.success = score.success + 1;
                }
            }
        }
    );

    const bg = score.failure > 0 ? 'bgRed' : 'bgGreen';
    const fg = score.failure > 0 ? 'white' : 'black';

    console.log(chalk.bold[bg][fg](` ${score.failure > 0 ? 'Failure' : 'Success'}: ${score.success + score.failure + score.skipped} tests, ${score.success} success, ${score.failure} failures, ${score.skipped} skipped. `));

    if (config.exitOnFailure) {
        process.exit(1);
    }
};

exports.onStart = ev => {
    config = Object.assign(
        {},
        {
            assert: 'node',
            exitOnFailure: false,
            exitWithFailure: true
        },
        ev.data.option
    );

    queue = new Queue();

    score = {
        success: 0,
        failure: 0,
        skipped: 0,
    };
};

exports.onComplete = ev => {
    if (config.exitWithFailure && score.failure > 0) {
        process.exit(1);
    }
};
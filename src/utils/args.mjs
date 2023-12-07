import { parseArgs } from 'node:util';

export function getArgs(options) {
    const config = {
        args: process.argv.slice(2),
        options,
        strict: true,
    };

    const { values } = parseArgs(config);

    return values;
}

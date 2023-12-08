import { readFile } from 'node:fs/promises';
import { EOL } from 'node:os';

import { getArgs } from '../utils/args.mjs';

const firstDigitRegex = /^[^\d]*(?<firstDigit>\d)/;
const lastDigitRegex = /(?<lastDigit>\d)[^\d]*$/;

/**
 * Main entry point.
 */

async function main() {
    const args = getArgs({
        input: {
            type: 'string',
        },
    });

    const inputText = await readFile(args.input, { encoding: 'utf-8' });

    const total = inputText
        .split(EOL)
        .filter(x => x)
        .reduce(
            (accum, curr) => {
                const firstDigitStr = firstDigitRegex.exec(curr).groups.firstDigit;
                const lastDigitStr = lastDigitRegex.exec(curr).groups.lastDigit;
                const value = Number.parseInt(`${firstDigitStr}${lastDigitStr}`);
                return accum + value;
            },
            0
        );

    console.log(`Answer: ${total}`);
}

main()
    .then(() => console.log('Script completed successfully.'))
    .catch((err) => console.error('Script failed with error', err));

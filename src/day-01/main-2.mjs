import { readFile } from 'node:fs/promises';
import { EOL } from 'node:os';

import { getArgs } from '../utils/args.mjs';

/**
 * Extract the "calibration value" for an input line. This looks for both numerical digits and spelled numbers "one"
 * through "nine". We combine the first and last of these numbers to form the calibration value.
 *
 * Example: "sevenlsg6hei2oneg3is" would be 73. We extract the "seven" and 3, then combine them to 73.
 *
 * Note that there are tricky cases like "oneight" that share a common letter. We must parse this as both 1 and 8.
 * @param {string} line One line of text from the input file.
 * @returns {number} Calibration value for the line.
 */

function extractCalibrationValueForLine(line) {
    const numRegex = /(?=(?<digit>one|two|three|four|five|six|seven|eight|nine|\d))/g;
    const digitMap = {
        one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
        1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
    };

    const matchIterator = line.matchAll(numRegex);
    const digitList = Array.from(matchIterator).map(iter => digitMap[iter.groups.digit]);

    if (digitList.length === 0) {
        throw new Error(`Line of text contained no calibration values: ${line}`);
    }

    const firstDigit = digitList[0];
    const lastDigit = digitList[digitList.length - 1];

    const value = Number.parseInt(`${firstDigit}${lastDigit}`);

    return value;
}

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
        .map(x => x.toLowerCase())
        .reduce((accum, line) => accum + extractCalibrationValueForLine(line), 0);

    console.log(`Answer: ${total}`);
}

main()
    .then(() => console.log('Script completed successfully.'))
    .catch((err) => console.error('Script failed with error', err));

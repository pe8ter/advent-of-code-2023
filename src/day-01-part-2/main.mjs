import { readFile } from 'node:fs/promises';
import { EOL } from 'node:os';

import { getArgs } from '../utils/args.mjs';

/**
 * Extract the "calibration value" for an input line. This looks for both numerical digits and spelled numbers "one"
 * through "nine". The first and last of these numbers are combined to become the calibration value.
 *
 * Example: "sevenlsg6hei2oneg3is" would be 73. We extract the "seven" and 3, then combine them to 73.
 *
 * Note that there are tricky cases like "oneight" that share a common letter. We must parse this as both 1 and 8.
 * @param {string} line One line of text from the input file.
 * @returns Calibration value for the line.
 */

function extractCalibrationValueForLine(line) {
    const numRegex = /^[1-9]$/;
    const digitMap = {
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
    };

    const digitList = [];

    for (let i = 0; i < line.length; ++i) {
        const c = line.charAt(i);

        if (numRegex.test(c)) {
            digitList.push(c);
            continue;
        }

        const partialLine = line.slice(i);

        for (const entry of Object.entries(digitMap)) {
            const spelledDigit = entry[0];
            const numericalDigit = entry[1];
            if (partialLine.startsWith(spelledDigit)) {
                digitList.push(numericalDigit);
                break;
            }
        }
    }

    if (digitList.length === 0) {
        return 0;
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

import { readFile } from 'node:fs/promises';
import { EOL } from 'node:os';

import { getArgs } from '../utils/args.mjs';

const SPACER = '.';

/**
 * @typedef {{value: number, line: number, length: number, start: number, end: number}} Part
 */

/**
 * Extract the potential parts from the entire input. Each member of the result array is a "potential part" because
 * no determination has yet been made if the number represents a "part" according to the rules of the exercise.
 * @param {string} inputText
 * @returns {{parts: Array<Part>, raw: Array<Array<string>>}}
 */

function convertInputToData(inputText) {
    const lines = inputText
        .split(EOL)
        .filter(line => line);

    const raw = lines.map(line => [...line]);

    const parts = [];

    for (let i = 0; i < lines.length; ++i) {
        const numberRegex = /(?<value>\d+)/g;
        let numberRegexResult;

        while (numberRegexResult = numberRegex.exec(lines[i])) {
            const value = Number.parseInt(numberRegexResult.groups.value);
            const line = i;
            const length = numberRegexResult.groups.value.length;
            const start = numberRegexResult.index;
            const end = start + length - 1;
            const part = { value, line, length, start, end };
            parts.push(part);
        }
    }

    const result = { parts, raw };

    return result;
}

/**
 * Determine if a part it truly a part according to the rules of the exercise: it must have a "symbol" surrounding it.
 * A "symbol" is non-number and non-period character.
 * @param {Part} part
 * @param {Array<Array<string>>} raw
 * @returns {boolean}
 */

function isValuePartNumber(part, raw) {
    // Assume all lines have the same length.
    const lineLength = raw[part.line].length;
    const digitRegex = /^\d$/;

    // Test line above part.line.
    if (part.line !== 0) {
        const start = part.start === 0 ? 0 : part.start - 1;
        const end = part.end === lineLength - 1 ? lineLength - 1 : part.end + 1;
        for (let i = start; i <= end; ++i) {
            const char = raw[part.line - 1][i];
            if (char !== SPACER && !digitRegex.test(char)) {
                return true;
            }
        }
    }

    // Test characters around part.value on its own line.
    if (part.start !== 0 && raw[part.line][part.start - 1] !== SPACER) {
        return true;
    } else if (part.end !== lineLength - 1 && raw[part.line][part.end + 1] !== SPACER) {
        return true;
    }

    // Test line below part.line.
    if (part.line !== raw.length - 1) {
        const start = part.start === 0 ? 0 : part.start - 1;
        const end = part.end === lineLength - 1 ? lineLength - 1 : part.end + 1;
        for (let i = start; i <= end; ++i) {
            const char = raw[part.line + 1][i];
            if (char !== SPACER && !digitRegex.test(char)) {
                return true;
            }
        }
    }

    return false;
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
    const { parts, raw } = convertInputToData(inputText);

    const total = parts
        .filter((part) => isValuePartNumber(part, raw))
        .reduce((accum, part) => accum + part.value, 0);

    console.log(`Answer: ${total}`);
}

main()
    .then(() => console.log('Script completed successfully.'))
    .catch((err) => console.error('Script failed with error', err));

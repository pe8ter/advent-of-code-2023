import { readFile } from 'node:fs/promises';
import { EOL } from 'node:os';

import { getArgs } from '../utils/args.mjs';

const GEAR = '*';

/**
 * @typedef {{value: number, line: number, length: number, start: number, end: number}} Part
 */

/**
 * Helper function to test for a gear.
 * @param {string|Part} stringOrPart
 * @returns {boolean}
 */

function isGear(stringOrPart) {
    return stringOrPart === GEAR || stringOrPart.value === GEAR;
}

/**
 * Convert the entire input text to an array of arrays that contain parts. Each sub-array contains parts for one line of
 * input text. This function does not search for gears that touch numbers, called "neighbors" here.
 * @param {string} inputText
 * @returns {Array<Array<Part>>}
 */

function convertInputToParts(inputText) {
    const lines = inputText
        .split(EOL)
        .filter(line => line);

    const parts = [];

    for (let i = 0; i < lines.length; ++i) {
        const valueRegex = /(?<value>\d+|\*)/g;
        const matchIterator = lines[i].matchAll(valueRegex);
        const partList = Array.from(matchIterator)
            .map((iter) => {
                const value = isGear(iter.groups.value) ? GEAR : Number.parseInt(iter.groups.value);
                const line = i;
                const length = iter.groups.value.length;
                const start = iter.index;
                const end = start + length - 1;
                const neighbors = [];
                const part = { value, line, length, start, end, neighbors };
                return part;
            });

        parts.push(partList);
    }

    return parts;
}

/**
 * Mark a gear and a number as being neighbors of each other.
 * @param {Part} gear
 * @param {Part} number
 */

function markAsNeighbors(gear, number) {
    gear.neighbors.push(number);
    number.neighbors.push(gear);
}

/**
 * Given the set of parts, search for numbers that touch gears, then mark them as neighbors.
 * @param {Array<Array<Part>>} parts
 */

function addNeighborsToParts(parts) {
    for (let i = 0; i < parts.length; ++i) {
        for (let j = 0; j < parts[i].length; ++j) {
            if (isGear(parts[i][j])) {
                continue;
            }

            const number = parts[i][j];

            // Search line above line i.
            if (i > 0) {
                for (let k = 0; k < parts[i-1].length; ++k) {
                    if (!isGear(parts[i-1][k])) {
                        continue;
                    }
                    const gear = parts[i-1][k];
                    if ((gear.start >= number.start - 1) && (gear.start <= number.end + 1)) {
                        markAsNeighbors(gear, number);
                    }
                }
            }

            // Search sides of number for gears on line i.
            for (let k = 0; k < parts[i].length; ++k) {
                if (!isGear(parts[i][k])) {
                    continue;
                }
                const gear = parts[i][k];

                if ((gear.start === number.start - 1) || (gear.start === number.end + 1)) {
                    markAsNeighbors(gear, number);
                }
            }

            // Search line below line i.
            if (i < parts.length - 1) {
                for (let k = 0; k < parts[i+1].length; ++k) {
                    if (!isGear(parts[i+1][k])) {
                        continue;
                    }
                    const gear = parts[i+1][k];
                    if ((gear.start >= number.start - 1) && (gear.start <= number.end + 1)) {
                        markAsNeighbors(gear, number);
                    }
                }
            }
        }
    }
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
    const parts = convertInputToParts(inputText);

    addNeighborsToParts(parts);

    const total = parts.flat(Infinity)
        .filter((part) => part.value === GEAR)
        .reduce((accum, part) => accum + (part.neighbors.length === 2 ? (part.neighbors[0].value * part.neighbors[1].value) : 0), 0);

    console.log(`Answer: ${total}`);
}

main()
    .then(() => console.log('Script completed successfully.'))
    .catch((err) => console.error('Script failed with error', err));

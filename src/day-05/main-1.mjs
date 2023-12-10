import { readFile } from 'node:fs/promises';
import { EOL } from 'node:os';

import { getArgs } from '../utils/args.mjs';

/**
 * @typedef {{dest: number, source: number, length: number, length: number}} Range
 * @typedef {Record<string, Array<Range>>} RangeMap
 * @typedef {Record<string, string>} ConnectionMap
 */

/**
 * Convert entire input text into a set of data structures we can use to search the data.
 * @param {string} inputText
 * @returns {{seeds: Array<number>, maps: RangeMap, connections: ConnectionMap}}
 */

function convertInputToData(inputText) {
    const seeds = [];
    const maps = {};
    const connections = {};

    const blocks = inputText.split(EOL + EOL);

    // First block is the seeds list.
    const firstBlock = blocks.splice(0, 1)[0];
    const seedRegex = /\d+/g;
    const seedRegexResult = firstBlock.match(seedRegex);
    seeds.push(...seedRegexResult.map(num => Number.parseInt(num)));

    // Remaining blocks are range mappings.
    for (const block of blocks) {
        const lines = block.split(EOL).filter(line => line);

        // The first line of a range mapping block contains the types of range data being mapped.
        const firstLine = lines.splice(0, 1)[0];
        const typeRegex = /^(?<sourceType>[a-z]+)-to-(?<destType>[a-z]+) map:$/;
        const typeRegexResult = typeRegex.exec(firstLine);
        const sourceType = typeRegexResult.groups.sourceType;
        const destType = typeRegexResult.groups.destType;

        connections[sourceType] = destType;
        maps[sourceType] = [];

        // The remaining lines in a block contain the range data.
        for (const line of lines) {
            const rangeRegex = /^(?<dest>\d+) (?<source>\d+) (?<length>\d+)$/;
            const rangeRegexResult = rangeRegex.exec(line);
            const dest = Number.parseInt(rangeRegexResult.groups.dest);
            const source = Number.parseInt(rangeRegexResult.groups.source);
            const length = Number.parseInt(rangeRegexResult.groups.length);
            const range = { dest, source, length };
            maps[sourceType].push(range);
        }
    }

    const result = { seeds, maps, connections };

    return result;
}

/**
 * Search the entire data set given some input value and data type.
 * @param {number} sourceValue
 * @param {string} sourceType
 * @param {RangeMap} maps
 * @param {ConnectionMap} connections
 * @returns
 */

function findLocation(sourceValue, sourceType, maps, connections) {
    const map = maps[sourceType];

    if (!map) {
        return sourceValue;
    }

    let destValue = sourceValue;

    for (const submap of map) {
        if (sourceValue >= submap.source && sourceValue < submap.source + submap.length) {
            const delta = sourceValue - submap.source;
            destValue = submap.dest + delta;
            break;
        }
    }

    const destSourceType = connections[sourceType];

    if (destSourceType) {
        return findLocation(destValue, destSourceType, maps, connections);
    }

    return destValue;
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

    const { seeds, maps, connections } = convertInputToData(inputText);

    const locations = seeds.map((seedValue) => findLocation(seedValue, 'seed', maps, connections));
    const minLocation = Math.min(...locations);

    console.log(`Answer: ${minLocation}`);
}

main()
    .then(() => console.log('Script completed successfully.'))
    .catch((err) => console.error('Script failed with error', err));

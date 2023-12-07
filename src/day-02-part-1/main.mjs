import { readFile } from 'node:fs/promises';
import { EOL } from 'node:os';

import { getArgs } from '../utils/args.mjs';

/**
 * Extract the results for a "game" for an input line. A game includes its index and a list of collection of colors.
 * Each set is separated by semi-colons. Each color is separated by commas.
 *
 * Example: "Game 42: 5 red, 2 green, 1 blue; 20 red" becomes:
 *     { index: 42, sets: [{ red: 5, green: 2, blue: 1 }, { red: 20, green: 0, blue: 0 }] }
 *
 * Notice how we fill missing colors in with zeros.
 * @param {string} line One line of text from the input file.
 * @returns Data structure that represent a game.
 */

function convertInputLineToGame(line) {
    const indexRegex = /(?<index>[\d]+)/;

    const indexAndSetsText = line.split(':');
    const index = Number.parseInt(indexRegex.exec(indexAndSetsText[0]));

    const sets = [];

    for (const setText of indexAndSetsText[1].split(';')) {
        let red = 0;
        let green = 0;
        let blue = 0;
        for (const colorResultText of setText.split(',')) {
            const countAndColor = colorResultText.trim().split(' ');
            const count = Number.parseInt(countAndColor[0]);
            const color = countAndColor[1].toLowerCase();
            switch (color) {
                case 'red':
                    red = count;
                    break;
                case 'green':
                    green = count;
                    break;
                case 'blue':
                    blue = count;
                    break;
                default:
                    throw new Error(`Did not recognize color "${color}"`);
            }
        }
        sets.push({ red, green, blue });
    }

    const result = { index, sets };

    return result;
}

/**
 * Main entry point.
 */

async function main() {
    const args = getArgs({
        input: {
            type: 'string',
        },
        red: {
            type: 'string',
        },
        green: {
            type: 'string',
        },
        blue: {
            type: 'string',
        },
    });

    const input = args.input;
    const red = Number.parseInt(args.red);
    const green = Number.parseInt(args.green);
    const blue = Number.parseInt(args.blue);

    const inputText = await readFile(input, { encoding: 'utf-8' });

    const games = inputText
        .split(EOL)
        .filter(x => x)
        .map((line) => convertInputLineToGame(line));

    const qualifyingGames = [];

    for (const game of games) {
        let isGameQualifying = true;

        for (const set of game.sets) {
            if (set.red > red || set.green > green || set.blue > blue) {
                isGameQualifying = false;
                break;
            }
        }

        if (isGameQualifying) {
            qualifyingGames.push(game);
        }
    }

    const total = qualifyingGames.reduce((accum, game) => accum + game.index, 0);

    console.log(`Answer: ${total}`);
}

main()
    .then(() => console.log('Script completed successfully.'))
    .catch((err) => console.error('Script failed with error', err));

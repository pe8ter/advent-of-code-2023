import { readFile } from 'node:fs/promises';
import { EOL } from 'node:os';

import { getArgs } from '../utils/args.mjs';

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
        .filter(line => line)
        .map((line) => {
            const ticketRegex = /^Card +(?<index>\d+): +(?<winningNumbers>\d+[ \d]+\d+) +\| +(?<yourNumbers>\d+[ \d]+\d+)$/;
            const ticketRegexMatch = line.match(ticketRegex);
            const index = ticketRegexMatch.groups.index;
            const winningNumbers = ticketRegexMatch.groups.winningNumbers.split(/ +/).map((num) => Number.parseInt(num)).sort();
            const yourNumbers = ticketRegexMatch.groups.yourNumbers.split(/ +/).map((num) => Number.parseInt(num)).sort();
            const ticket = { index, winningNumbers, yourNumbers };
            return ticket;
        })
        .map((ticket) => {
            const countOfWinningNumbers = ticket.winningNumbers.reduce((accum, num) => accum + (ticket.yourNumbers.indexOf(num) > -1 ? 1 : 0), 0);
            const points = countOfWinningNumbers === 0 ? 0 : Math.pow(2, countOfWinningNumbers - 1);
            return points;
        })
        .reduce((accum, points) => accum + points, 0);

    console.log(`Answer: ${total}`);
}

main()
    .then(() => console.log('Script completed successfully.'))
    .catch((err) => console.error('Script failed with error', err));

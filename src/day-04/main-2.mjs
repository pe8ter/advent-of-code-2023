import { readFile } from 'node:fs/promises';
import { EOL } from 'node:os';

import { getArgs } from '../utils/args.mjs';

/**
 * @typedef {{index: number, winningNumbers: Array<number>, yourNumbers: Array<number>, countOfWinningNumbers: number}} Card
 */

/**
 * Recursively count number of cloned cards from a card's winning number count.
 * @param {Card} card
 * @param {Record<number, Card>} cards
 * @returns {number}
 */

function visitCard(card, cards) {
    let count = 1;

    for (let i = card.index + 1; i <= card.index + card.countOfWinningNumbers; ++i) {
        count += visitCard(cards[i], cards);
    }

    return count;
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

    const cards = {};

    inputText
        .split(EOL)
        .filter(line => line)
        .map((line) => {
            const ticketRegex = /^Card +(?<index>\d+): +(?<winningNumbers>\d+[ \d]+\d+) +\| +(?<yourNumbers>\d+[ \d]+\d+)$/;
            const ticketRegexMatch = line.match(ticketRegex);
            const index = Number.parseInt(ticketRegexMatch.groups.index);
            const winningNumbers = ticketRegexMatch.groups.winningNumbers.split(/ +/).map((num) => Number.parseInt(num)).sort();
            const yourNumbers = ticketRegexMatch.groups.yourNumbers.split(/ +/).map((num) => Number.parseInt(num)).sort();
            const countOfWinningNumbers = winningNumbers.reduce((accum, num) => accum + (yourNumbers.indexOf(num) > -1 ? 1 : 0), 0);
            const ticket = { index, winningNumbers, yourNumbers, countOfWinningNumbers };
            return ticket;
        })
        .forEach((card) => cards[card.index] = card);

    const total = Object.entries(cards).reduce((accum, entry) => accum + visitCard(entry[1], cards), 0);

    console.log(`Answer: ${total}`);
}

main()
    .then(() => console.log('Script completed successfully.'))
    .catch((err) => console.error('Script failed with error', err));

'use strict';

const readline = require('readline');

/**
 * Prompts the user with a question and returns the answer.
 * @param {string} question - The question to ask
 * @returns {Promise<string>} The answer, lowercased and trimmed
 */
async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

module.exports = {
  prompt
};

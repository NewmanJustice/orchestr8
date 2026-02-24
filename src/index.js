const { init } = require('./init');
const { update } = require('./update');
const { addSkills, listSkills, AGENT_SKILLS } = require('./skills');
const { validate, formatOutput, checkNodeVersion } = require('./validate');
const { recordHistory, displayHistory, showStats, clearHistory } = require('./history');
const {
  readConfig,
  writeConfig,
  resetConfig,
  calculateFailureRate,
  recommendStrategy,
  applyStrategy,
  shouldRetry
} = require('./retry');

module.exports = {
  init,
  update,
  addSkills,
  listSkills,
  AGENT_SKILLS,
  validate,
  formatOutput,
  checkNodeVersion,
  recordHistory,
  displayHistory,
  showStats,
  clearHistory,
  // Retry module exports
  readConfig,
  writeConfig,
  resetConfig,
  calculateFailureRate,
  recommendStrategy,
  applyStrategy,
  shouldRetry
};

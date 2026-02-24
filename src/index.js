const { init } = require('./init');
const { update } = require('./update');
const { addSkills, listSkills, AGENT_SKILLS } = require('./skills');
const { validate, formatOutput, checkNodeVersion } = require('./validate');
const { recordHistory, displayHistory, showStats, clearHistory } = require('./history');

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
  clearHistory
};

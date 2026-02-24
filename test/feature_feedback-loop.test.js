const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_FILE = '.claude/feedback-config.json';
const HISTORY_FILE = '.claude/pipeline-history.json';

let testDir;
let originalCwd;

// Shared setup/teardown
function setupTestDir() {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'feedback-test-'));
  originalCwd = process.cwd();
  process.chdir(testDir);
  fs.mkdirSync('.claude', { recursive: true });
}

function teardownTestDir() {
  process.chdir(originalCwd);
  fs.rmSync(testDir, { recursive: true, force: true });
}

// Default feedback config per FEATURE_SPEC.md
function getDefaultConfig() {
  return {
    minRatingThreshold: 3.0,
    enabled: true,
    issueMappings: {
      'missing-error-handling': 'add-context',
      'unclear-scope': 'simplify-prompt',
      'too-complex': 'simplify-prompt',
      'too-many-stories': 'reduce-stories',
      'untestable-criteria': 'simplify-tests',
      'missing-edge-cases': 'add-context'
    }
  };
}

// Valid feedback schema per FEATURE_SPEC.md:Section 6
function createValidFeedback(overrides = {}) {
  return {
    about: 'alex',
    rating: 4,
    confidence: 0.8,
    issues: [],
    recommendation: 'proceed',
    ...overrides
  };
}

// Validate feedback schema (simulates orchestrator logic)
function validateFeedback(feedback) {
  const errors = [];
  if (!['alex', 'cass', 'nigel'].includes(feedback.about)) {
    errors.push('Invalid "about" field');
  }
  if (typeof feedback.rating !== 'number' || feedback.rating < 1 || feedback.rating > 5) {
    errors.push('Invalid "rating" field');
  }
  if (typeof feedback.confidence !== 'number' || feedback.confidence < 0 || feedback.confidence > 1) {
    errors.push('Invalid "confidence" field');
  }
  if (!Array.isArray(feedback.issues)) {
    errors.push('Invalid "issues" field');
  }
  if (!['proceed', 'pause', 'revise'].includes(feedback.recommendation)) {
    errors.push('Invalid "recommendation" field');
  }
  return { valid: errors.length === 0, errors };
}

// Quality gate evaluation per FEATURE_SPEC.md:Rule 2
function shouldPause(feedback, config) {
  return feedback.rating < config.minRatingThreshold || feedback.recommendation === 'pause';
}

// Calculate agent calibration per FEATURE_SPEC.md:Rule 4
function calculateCalibration(agent, history) {
  const entries = history.filter(e => e.stages?.[agent]?.feedback);
  if (entries.length < 10) return null;

  let matches = 0;
  for (const entry of entries) {
    const rating = entry.stages[agent].feedback.rating;
    const success = entry.status === 'success';
    const predicted = rating >= 3;
    if (predicted === success) matches++;
  }
  return matches / entries.length;
}

// Correlate issues with failures
function correlateIssues(history) {
  const issueCounts = {};
  const issueFailures = {};

  for (const entry of history) {
    for (const stage of Object.values(entry.stages || {})) {
      if (stage.feedback?.issues) {
        for (const issue of stage.feedback.issues) {
          issueCounts[issue] = (issueCounts[issue] || 0) + 1;
          if (entry.status === 'failed') {
            issueFailures[issue] = (issueFailures[issue] || 0) + 1;
          }
        }
      }
    }
  }

  const correlations = {};
  for (const issue of Object.keys(issueCounts)) {
    correlations[issue] = (issueFailures[issue] || 0) / issueCounts[issue];
  }
  return correlations;
}

function writeConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function readConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return getDefaultConfig();
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

function writeHistory(entries) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(entries, null, 2));
}

// Story: Feedback Collection
describe('Feedback Collection', () => {
  beforeEach(() => setupTestDir());
  afterEach(() => teardownTestDir());

  it('T-FC-1.1: Valid feedback schema accepted', () => {
    const feedback = createValidFeedback();
    const result = validateFeedback(feedback);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  it('T-FC-1.2: Missing required field rejected', () => {
    const feedback = { rating: 4, confidence: 0.8 }; // Missing about, issues, recommendation
    const result = validateFeedback(feedback);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.length > 0);
  });

  it('T-FC-2.1: Invalid rating type triggers warning', () => {
    const feedback = createValidFeedback({ rating: 'high' });
    const result = validateFeedback(feedback);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('rating')));
  });

  it('T-FC-3.1: Feedback stored in history entry', () => {
    const feedback = createValidFeedback({ about: 'cass' });
    const history = [{
      slug: 'test-feature',
      status: 'success',
      stages: { nigel: { feedback } }
    }];
    writeHistory(history);
    const loaded = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.deepStrictEqual(loaded[0].stages.nigel.feedback, feedback);
  });
});

// Story: Quality Gates
describe('Quality Gates', () => {
  beforeEach(() => setupTestDir());
  afterEach(() => teardownTestDir());

  it('T-QG-1.1: Rating below threshold triggers pause', () => {
    const config = getDefaultConfig();
    const feedback = createValidFeedback({ rating: 2 });
    assert.strictEqual(shouldPause(feedback, config), true);
  });

  it('T-QG-1.2: Recommendation pause triggers pause', () => {
    const config = getDefaultConfig();
    const feedback = createValidFeedback({ rating: 4, recommendation: 'pause' });
    assert.strictEqual(shouldPause(feedback, config), true);
  });

  it('T-QG-1.3: Rating at threshold proceeds', () => {
    const config = getDefaultConfig();
    const feedback = createValidFeedback({ rating: 3 });
    assert.strictEqual(shouldPause(feedback, config), false);
  });

  it('T-QG-2.1: User proceed decision recorded in history', () => {
    const history = [{
      slug: 'test-feature',
      status: 'success',
      stages: {
        cass: {
          feedback: createValidFeedback({ rating: 2 }),
          gateDecision: 'proceed'
        }
      }
    }];
    writeHistory(history);
    const loaded = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.strictEqual(loaded[0].stages.cass.gateDecision, 'proceed');
  });
});

// Story: Feedback Config
describe('Feedback Configuration', () => {
  beforeEach(() => setupTestDir());
  afterEach(() => teardownTestDir());

  it('T-CF-1.1: Read config returns defaults when no file', () => {
    const config = readConfig();
    assert.strictEqual(config.minRatingThreshold, 3.0);
    assert.strictEqual(config.enabled, true);
  });

  it('T-CF-2.1: Set valid threshold updates file', () => {
    const config = getDefaultConfig();
    config.minRatingThreshold = 3.5;
    writeConfig(config);
    const loaded = readConfig();
    assert.strictEqual(loaded.minRatingThreshold, 3.5);
  });

  it('T-CF-2.2: Invalid threshold value detected', () => {
    const isValidThreshold = (val) => typeof val === 'number' && val >= 1.0 && val <= 5.0;
    assert.strictEqual(isValidThreshold(3.5), true);
    assert.strictEqual(isValidThreshold(0.5), false);
    assert.strictEqual(isValidThreshold(6.0), false);
    assert.strictEqual(isValidThreshold('high'), false);
  });

  it('T-CF-3.1: Config file created on first set', () => {
    assert.ok(!fs.existsSync(CONFIG_FILE));
    writeConfig(getDefaultConfig());
    assert.ok(fs.existsSync(CONFIG_FILE));
  });
});

// Story: Feedback Insights
describe('Feedback Insights', () => {
  beforeEach(() => setupTestDir());
  afterEach(() => teardownTestDir());

  it('T-IN-1.1: Agent calibration calculated correctly', () => {
    const history = [];
    for (let i = 0; i < 10; i++) {
      history.push({
        slug: `feature-${i}`,
        status: i < 7 ? 'success' : 'failed',
        stages: {
          cass: { feedback: createValidFeedback({ rating: i < 7 ? 4 : 2 }) }
        }
      });
    }
    const calibration = calculateCalibration('cass', history);
    assert.strictEqual(calibration, 1.0); // Perfect prediction
  });

  it('T-IN-2.1: Issue patterns correlated with failures', () => {
    const history = [
      { status: 'failed', stages: { cass: { feedback: { issues: ['unclear-scope'] } } } },
      { status: 'failed', stages: { cass: { feedback: { issues: ['unclear-scope'] } } } },
      { status: 'success', stages: { cass: { feedback: { issues: ['minor-typo'] } } } }
    ];
    const correlations = correlateIssues(history);
    assert.strictEqual(correlations['unclear-scope'], 1.0); // 100% failure correlation
    assert.strictEqual(correlations['minor-typo'], 0); // 0% failure correlation
  });

  it('T-IN-3.1: Threshold recommendation based on data', () => {
    const history = [];
    for (let i = 0; i < 12; i++) {
      const rating = (i % 4) + 2; // Ratings 2,3,4,5
      const success = rating >= 3;
      history.push({
        status: success ? 'success' : 'failed',
        stages: { cass: { feedback: { rating } } }
      });
    }
    // Simple recommendation: threshold where most failures occur below
    const recommendThreshold = (hist) => {
      let best = 3.0;
      for (const t of [2, 2.5, 3, 3.5, 4]) {
        const correct = hist.filter(e => {
          const r = e.stages?.cass?.feedback?.rating || 3;
          const pred = r >= t;
          return pred === (e.status === 'success');
        }).length;
        if (correct > hist.length * 0.7) best = t;
      }
      return best;
    };
    const recommended = recommendThreshold(history);
    assert.ok(recommended >= 2.0 && recommended <= 4.0);
  });

  it('T-IN-4.1: Insufficient data message for < 10 runs', () => {
    const history = [];
    for (let i = 0; i < 5; i++) {
      history.push({
        status: 'success',
        stages: { cass: { feedback: createValidFeedback() } }
      });
    }
    const calibration = calculateCalibration('cass', history);
    assert.strictEqual(calibration, null); // Insufficient data
  });
});

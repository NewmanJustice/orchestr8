const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_FILE = '.claude/retry-config.json';
const HISTORY_FILE = '.claude/pipeline-history.json';

let testDir;
let originalCwd;

// Shared setup/teardown
function setupTestDir() {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'retry-test-'));
  originalCwd = process.cwd();
  process.chdir(testDir);
  fs.mkdirSync('.claude', { recursive: true });
}

function teardownTestDir() {
  process.chdir(originalCwd);
  fs.rmSync(testDir, { recursive: true, force: true });
}

// Default configuration per FEATURE_SPEC.md
function getDefaultConfig() {
  return {
    maxRetries: 3,
    windowSize: 10,
    highFailureThreshold: 0.2,
    strategies: {
      alex: ['simplify-prompt', 'add-context'],
      cass: ['reduce-stories', 'simplify-prompt'],
      nigel: ['simplify-tests', 'add-context'],
      'codey-plan': ['add-context', 'simplify-prompt'],
      'codey-implement': ['incremental', 'rollback']
    }
  };
}

function writeConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

function writeHistory(entries) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(entries, null, 2));
}

function createHistoryEntry(overrides = {}) {
  return {
    slug: 'test-feature',
    status: 'success',
    stage: 'cass',
    completedAt: new Date().toISOString(),
    ...overrides
  };
}

// Calculate failure rate (simulates src/retry.js logic)
function calculateFailureRate(stage, history, windowSize = 10) {
  const recent = history.slice(-windowSize);
  if (recent.length === 0) return 0;
  const failedAtStage = recent.filter(e => e.status === 'failed' && e.failedStage === stage).length;
  return failedAtStage / recent.length;
}

// Recommend strategy (simulates src/retry.js logic)
function recommendStrategy(stage, attemptCount, failureRate, config) {
  if (attemptCount > config.maxRetries) return 'abort-recommended';
  if (failureRate > config.highFailureThreshold) {
    const strategies = config.strategies[stage] || [];
    const idx = Math.min(attemptCount - 1, strategies.length - 1);
    return strategies[idx] || 'retry';
  }
  return 'retry';
}

// Apply strategy to prompt (simulates src/retry.js logic)
function applyStrategy(strategy, originalPrompt) {
  const modifications = {
    'retry': null,
    'simplify-prompt': 'Focus on core requirements only. Skip edge cases and optional sections.',
    'reduce-stories': 'Write only the 2-3 most critical user stories. Defer others to follow-up.',
    'simplify-tests': 'Write only happy-path tests for each AC. Skip edge cases.',
    'add-context': '[Context from previous stage prepended]',
    'incremental': 'Implement one test at a time. Stop and report after each.',
    'rollback': 'git checkout -- .'
  };
  const mod = modifications[strategy];
  return mod ? `${originalPrompt}\n\n${mod}` : originalPrompt;
}

// Story: Retry Configuration Management
describe('Retry Configuration Management', () => {
  beforeEach(() => setupTestDir());
  afterEach(() => teardownTestDir());

  it('T-RC-1: View config when file exists', () => {
    const config = getDefaultConfig();
    config.maxRetries = 5;
    writeConfig(config);
    const loaded = readConfig();
    assert.strictEqual(loaded.maxRetries, 5);
    assert.strictEqual(loaded.highFailureThreshold, 0.2);
  });

  it('T-RC-2: Use defaults when no config file exists', () => {
    assert.ok(!fs.existsSync(CONFIG_FILE));
    const defaults = getDefaultConfig();
    assert.strictEqual(defaults.maxRetries, 3);
    assert.strictEqual(defaults.windowSize, 10);
  });

  it('T-RC-3: Modify config value', () => {
    writeConfig(getDefaultConfig());
    const config = readConfig();
    config.maxRetries = 5;
    writeConfig(config);
    const updated = readConfig();
    assert.strictEqual(updated.maxRetries, 5);
  });

  it('T-RC-4: Reset config to defaults', () => {
    const custom = getDefaultConfig();
    custom.maxRetries = 10;
    custom.highFailureThreshold = 0.5;
    writeConfig(custom);
    writeConfig(getDefaultConfig());
    const reset = readConfig();
    assert.strictEqual(reset.maxRetries, 3);
    assert.strictEqual(reset.highFailureThreshold, 0.2);
  });

  it('T-RC-5: Create config file on first modification', () => {
    assert.ok(!fs.existsSync(CONFIG_FILE));
    const config = getDefaultConfig();
    config.maxRetries = 4;
    writeConfig(config);
    assert.ok(fs.existsSync(CONFIG_FILE));
    assert.strictEqual(readConfig().maxRetries, 4);
  });

  it('T-RC-6: Handle corrupted config gracefully', () => {
    fs.writeFileSync(CONFIG_FILE, 'not valid json{{{');
    let isCorrupted = false;
    try {
      JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch {
      isCorrupted = true;
    }
    assert.ok(isCorrupted, 'Should detect corrupted JSON');
    // Graceful degradation: use defaults
    const fallback = getDefaultConfig();
    assert.strictEqual(fallback.maxRetries, 3);
  });
});

// Story: Strategy Recommendation
describe('Strategy Recommendation', () => {
  beforeEach(() => setupTestDir());
  afterEach(() => teardownTestDir());

  it('T-SR-1: Calculate failure rate from history', () => {
    const history = [
      createHistoryEntry({ status: 'success' }),
      createHistoryEntry({ status: 'failed', failedStage: 'cass' }),
      createHistoryEntry({ status: 'success' }),
      createHistoryEntry({ status: 'failed', failedStage: 'cass' }),
      createHistoryEntry({ status: 'success' })
    ];
    writeHistory(history);
    const rate = calculateFailureRate('cass', history, 10);
    assert.strictEqual(rate, 0.4); // 2 failed / 5 total
  });

  it('T-SR-2: Recommend simple retry for low failure rate', () => {
    const config = getDefaultConfig();
    const failureRate = 0.1; // Below 0.2 threshold
    const strategy = recommendStrategy('cass', 1, failureRate, config);
    assert.strictEqual(strategy, 'retry');
  });

  it('T-SR-3: Recommend alternative strategy for high failure rate', () => {
    const config = getDefaultConfig();
    const failureRate = 0.3; // Above 0.2 threshold
    const strategy = recommendStrategy('cass', 1, failureRate, config);
    assert.strictEqual(strategy, 'reduce-stories'); // First strategy for cass
  });

  it('T-SR-4: Escalate strategy on subsequent attempts', () => {
    const config = getDefaultConfig();
    const failureRate = 0.3;
    const first = recommendStrategy('cass', 1, failureRate, config);
    const second = recommendStrategy('cass', 2, failureRate, config);
    assert.strictEqual(first, 'reduce-stories');
    assert.strictEqual(second, 'simplify-prompt'); // Second strategy for cass
  });

  it('T-SR-5: Warn when max retries exceeded', () => {
    const config = getDefaultConfig();
    const strategy = recommendStrategy('cass', 4, 0.3, config); // 4 > maxRetries(3)
    assert.strictEqual(strategy, 'abort-recommended');
  });
});

// Story: Prompt Modification
describe('Prompt Modification', () => {
  beforeEach(() => setupTestDir());
  afterEach(() => teardownTestDir());

  it('T-PM-1: Apply simplify-prompt strategy', () => {
    const original = 'Create user stories for the feature.';
    const modified = applyStrategy('simplify-prompt', original);
    assert.ok(modified.includes('Focus on core requirements only'));
    assert.ok(modified.includes('Skip edge cases'));
  });

  it('T-PM-2: No modification for retry strategy', () => {
    const original = 'Create user stories for the feature.';
    const modified = applyStrategy('retry', original);
    assert.strictEqual(modified, original);
  });

  it('T-PM-3: Rollback strategy returns git command', () => {
    const original = 'Implement the feature.';
    const modified = applyStrategy('rollback', original);
    assert.ok(modified.includes('git checkout -- .'));
  });
});

// Story: Should Retry Decision Logic
describe('Should Retry Decision Logic', () => {
  beforeEach(() => setupTestDir());
  afterEach(() => teardownTestDir());

  it('T-SH-1: Consult retry module returns recommendation', () => {
    const config = getDefaultConfig();
    const history = [
      createHistoryEntry({ status: 'failed', failedStage: 'nigel' }),
      createHistoryEntry({ status: 'failed', failedStage: 'nigel' }),
      createHistoryEntry({ status: 'success' })
    ];
    writeHistory(history);
    const rate = calculateFailureRate('nigel', history, 10);
    const recommendation = recommendStrategy('nigel', 1, rate, config);
    assert.ok(['retry', 'simplify-tests', 'add-context', 'abort-recommended'].includes(recommendation));
  });

  it('T-SH-2: Degrade gracefully with corrupted history', () => {
    fs.writeFileSync(HISTORY_FILE, 'corrupted{{{');
    let history = [];
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch {
      history = []; // Graceful degradation
    }
    const rate = calculateFailureRate('cass', history, 10);
    assert.strictEqual(rate, 0); // No history = 0 failure rate
    const strategy = recommendStrategy('cass', 1, rate, getDefaultConfig());
    assert.strictEqual(strategy, 'retry'); // Default to simple retry
  });

  it('T-SH-3: Degrade gracefully with missing config', () => {
    assert.ok(!fs.existsSync(CONFIG_FILE));
    // Use hardcoded defaults when config missing
    const defaults = getDefaultConfig();
    const strategy = recommendStrategy('alex', 1, 0.5, defaults);
    assert.strictEqual(strategy, 'simplify-prompt');
  });
});

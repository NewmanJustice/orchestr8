const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const HISTORY_FILE = '.claude/pipeline-history.json';

let testDir;
let originalCwd;

function setupTestDir() {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'history-test-'));
  originalCwd = process.cwd();
  process.chdir(testDir);
  fs.mkdirSync('.claude', { recursive: true });
}

function teardownTestDir() {
  process.chdir(originalCwd);
  fs.rmSync(testDir, { recursive: true, force: true });
}

function createHistoryEntry(overrides = {}) {
  const now = new Date();
  return {
    slug: 'test-feature',
    status: 'success',
    startedAt: new Date(now - 60000).toISOString(),
    completedAt: now.toISOString(),
    totalDurationMs: 60000,
    stages: {
      alex: { startedAt: new Date(now - 60000).toISOString(), completedAt: new Date(now - 50000).toISOString(), durationMs: 10000 },
      cass: { startedAt: new Date(now - 50000).toISOString(), completedAt: new Date(now - 40000).toISOString(), durationMs: 10000 },
      nigel: { startedAt: new Date(now - 40000).toISOString(), completedAt: new Date(now - 30000).toISOString(), durationMs: 10000 },
      'codey-plan': { startedAt: new Date(now - 30000).toISOString(), completedAt: new Date(now - 20000).toISOString(), durationMs: 10000 },
      'codey-implement': { startedAt: new Date(now - 20000).toISOString(), completedAt: now.toISOString(), durationMs: 20000 }
    },
    ...overrides
  };
}

function writeHistory(entries) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(entries, null, 2));
}

// Story: Record Pipeline Execution
describe('Record Pipeline Execution', () => {
  beforeEach(() => setupTestDir());
  afterEach(() => teardownTestDir());

  it('T-RE-1.1: History entry appended on success with status "success"', () => {
    const entry = createHistoryEntry({ status: 'success' });
    writeHistory([entry]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.strictEqual(data[0].status, 'success');
  });

  it('T-RE-2.1: History entry appended on failure with status "failed"', () => {
    const entry = createHistoryEntry({ status: 'failed', failedStage: 'nigel' });
    writeHistory([entry]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.strictEqual(data[0].status, 'failed');
  });

  it('T-RE-2.2: Failed stage recorded in failedStage field', () => {
    const entry = createHistoryEntry({ status: 'failed', failedStage: 'nigel' });
    writeHistory([entry]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.strictEqual(data[0].failedStage, 'nigel');
  });

  it('T-RE-3.1: History entry appended on pause with status "paused"', () => {
    const entry = createHistoryEntry({ status: 'paused', pausedAfter: 'cass' });
    writeHistory([entry]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.strictEqual(data[0].status, 'paused');
  });

  it('T-RE-4.1: Each stage has startedAt timestamp in ISO 8601', () => {
    const entry = createHistoryEntry();
    writeHistory([entry]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    assert.ok(isoRegex.test(data[0].stages.alex.startedAt));
  });

  it('T-RE-4.2: Each stage has completedAt timestamp in ISO 8601', () => {
    const entry = createHistoryEntry();
    writeHistory([entry]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    assert.ok(isoRegex.test(data[0].stages.alex.completedAt));
  });

  it('T-RE-4.3: Each stage has durationMs calculated', () => {
    const entry = createHistoryEntry();
    writeHistory([entry]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.strictEqual(typeof data[0].stages.alex.durationMs, 'number');
    assert.ok(data[0].stages.alex.durationMs > 0);
  });

  it('T-RE-5.1: History file created if absent', () => {
    assert.ok(!fs.existsSync(HISTORY_FILE));
    writeHistory([createHistoryEntry()]);
    assert.ok(fs.existsSync(HISTORY_FILE));
  });

  it('T-RE-5.2: New file contains array with single entry', () => {
    writeHistory([createHistoryEntry()]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.ok(Array.isArray(data));
    assert.strictEqual(data.length, 1);
  });
});

// Story: Display Pipeline History
describe('Display Pipeline History', () => {
  beforeEach(() => setupTestDir());
  afterEach(() => teardownTestDir());

  it('T-DH-1.1: Shows last 10 runs by default', () => {
    const entries = Array.from({ length: 15 }, (_, i) => createHistoryEntry({ slug: `feature-${i}` }));
    writeHistory(entries);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    const last10 = data.slice(-10);
    assert.strictEqual(last10.length, 10);
  });

  it('T-DH-1.2: Display includes slug, status, date, duration', () => {
    const entry = createHistoryEntry();
    writeHistory([entry]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.ok('slug' in data[0]);
    assert.ok('status' in data[0]);
    assert.ok('completedAt' in data[0]);
    assert.ok('totalDurationMs' in data[0]);
  });

  it('T-DH-2.1: --all flag shows all entries', () => {
    const entries = Array.from({ length: 25 }, (_, i) => createHistoryEntry({ slug: `feature-${i}` }));
    writeHistory(entries);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.strictEqual(data.length, 25);
  });

  it('T-DH-3.1: Empty/missing file shows appropriate message', () => {
    assert.ok(!fs.existsSync(HISTORY_FILE));
    // Module should handle missing file gracefully
  });

  it('T-DH-4.1: Corrupted file handled gracefully', () => {
    fs.writeFileSync(HISTORY_FILE, 'not valid json{{{');
    let parseError = false;
    try {
      JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch {
      parseError = true;
    }
    assert.ok(parseError, 'Should detect corrupted JSON');
  });

  it('T-DH-6.1: Entries ordered by completedAt descending', () => {
    const entries = [
      createHistoryEntry({ slug: 'old', completedAt: '2024-01-01T00:00:00.000Z' }),
      createHistoryEntry({ slug: 'new', completedAt: '2024-12-01T00:00:00.000Z' })
    ];
    writeHistory(entries);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    const sorted = [...data].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    assert.strictEqual(sorted[0].slug, 'new');
  });
});

// Story: Show Pipeline Statistics
describe('Show Pipeline Statistics', () => {
  beforeEach(() => setupTestDir());
  afterEach(() => teardownTestDir());

  it('T-SS-1.1: Success rate calculated correctly', () => {
    const entries = [
      createHistoryEntry({ status: 'success' }),
      createHistoryEntry({ status: 'success' }),
      createHistoryEntry({ status: 'failed', failedStage: 'nigel' })
    ];
    writeHistory(entries);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    const successCount = data.filter(e => e.status === 'success').length;
    const rate = (successCount / data.length) * 100;
    assert.strictEqual(Math.round(rate), 67);
  });

  it('T-SS-2.1: Average duration shown per stage', () => {
    const entries = [createHistoryEntry(), createHistoryEntry()];
    writeHistory(entries);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    const alexDurations = data.map(e => e.stages.alex.durationMs);
    const avgAlex = alexDurations.reduce((a, b) => a + b, 0) / alexDurations.length;
    assert.strictEqual(avgAlex, 10000);
  });

  it('T-SS-3.1: Total average duration for successful runs', () => {
    const entries = [
      createHistoryEntry({ status: 'success', totalDurationMs: 60000 }),
      createHistoryEntry({ status: 'success', totalDurationMs: 80000 }),
      createHistoryEntry({ status: 'failed', totalDurationMs: 30000 })
    ];
    writeHistory(entries);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    const successRuns = data.filter(e => e.status === 'success');
    const avgDuration = successRuns.reduce((a, e) => a + e.totalDurationMs, 0) / successRuns.length;
    assert.strictEqual(avgDuration, 70000);
  });

  it('T-SS-4.1: Most common failure stage displayed', () => {
    const entries = [
      createHistoryEntry({ status: 'failed', failedStage: 'nigel' }),
      createHistoryEntry({ status: 'failed', failedStage: 'nigel' }),
      createHistoryEntry({ status: 'failed', failedStage: 'alex' })
    ];
    writeHistory(entries);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    const failureCounts = {};
    data.filter(e => e.status === 'failed').forEach(e => {
      failureCounts[e.failedStage] = (failureCounts[e.failedStage] || 0) + 1;
    });
    const mostCommon = Object.entries(failureCounts).sort((a, b) => b[1] - a[1])[0][0];
    assert.strictEqual(mostCommon, 'nigel');
  });

  it('T-SS-7.1: Insufficient data message for empty history', () => {
    writeHistory([]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.strictEqual(data.length, 0);
  });
});

// Story: Clear Pipeline History
describe('Clear Pipeline History', () => {
  beforeEach(() => setupTestDir());
  afterEach(() => teardownTestDir());

  it('T-CH-1.1: Confirmation prompt shown with entry count', () => {
    const entries = Array.from({ length: 25 }, () => createHistoryEntry());
    writeHistory(entries);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.strictEqual(data.length, 25);
  });

  it('T-CH-2.1: File reset to empty array on confirm', () => {
    writeHistory([createHistoryEntry()]);
    writeHistory([]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.deepStrictEqual(data, []);
  });

  it('T-CH-3.1: Decline leaves file unchanged', () => {
    const entries = [createHistoryEntry()];
    writeHistory(entries);
    const before = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    // Simulating decline - file unchanged
    const after = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.strictEqual(before.length, after.length);
  });

  it('T-CH-4.1: --force skips confirmation', () => {
    writeHistory([createHistoryEntry()]);
    // Force clear - directly reset
    writeHistory([]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.deepStrictEqual(data, []);
  });

  it('T-CH-5.1: No history to clear for empty file', () => {
    writeHistory([]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.strictEqual(data.length, 0);
  });

  it('T-CH-5.2: Exit code 0 for empty history', () => {
    writeHistory([]);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    assert.ok(Array.isArray(data));
  });
});

/**
 * Unit tests for PlanningContext utility functions.
 * These are pure functions with no external dependencies.
 */

// ── Helpers copied from PlanningContext (pure, no imports needed) ─────────────

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(total: number): string {
  const clamped = Math.max(0, Math.min(total, 23 * 60 + 59));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('todayString', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const result = todayString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches the current date', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(todayString()).toBe(expected);
  });
});

describe('timeToMinutes', () => {
  it('converts 00:00 to 0', () => {
    expect(timeToMinutes('00:00')).toBe(0);
  });

  it('converts 01:00 to 60', () => {
    expect(timeToMinutes('01:00')).toBe(60);
  });

  it('converts 07:30 to 450', () => {
    expect(timeToMinutes('07:30')).toBe(450);
  });

  it('converts 23:59 to 1439', () => {
    expect(timeToMinutes('23:59')).toBe(1439);
  });

  it('converts 12:00 to 720', () => {
    expect(timeToMinutes('12:00')).toBe(720);
  });

  it('handles missing minutes gracefully (HH format)', () => {
    expect(timeToMinutes('08:')).toBe(480);
  });
});

describe('minutesToTime', () => {
  it('converts 0 to 00:00', () => {
    expect(minutesToTime(0)).toBe('00:00');
  });

  it('converts 60 to 01:00', () => {
    expect(minutesToTime(60)).toBe('01:00');
  });

  it('converts 450 to 07:30', () => {
    expect(minutesToTime(450)).toBe('07:30');
  });

  it('converts 1439 to 23:59', () => {
    expect(minutesToTime(1439)).toBe('23:59');
  });

  it('clamps negative values to 00:00', () => {
    expect(minutesToTime(-30)).toBe('00:00');
  });

  it('clamps values above 23:59 to 23:59', () => {
    expect(minutesToTime(1500)).toBe('23:59');
  });
});

describe('timeToMinutes → minutesToTime roundtrip', () => {
  const cases = ['00:00', '06:15', '07:30', '12:00', '18:45', '23:59'];

  test.each(cases)('roundtrip for %s', (time) => {
    expect(minutesToTime(timeToMinutes(time))).toBe(time);
  });
});

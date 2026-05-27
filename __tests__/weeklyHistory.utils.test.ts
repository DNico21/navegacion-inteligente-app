/// <reference types="jest" />
/**
 * Unit tests for weekly-history calculation helpers.
 * Tests the CO₂ formula, stat aggregation, and week-date utilities.
 */

// ── Helpers (same logic as weekly-history.tsx) ────────────────────────────────

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function getWeekDates(): { dates: string[]; dayIndices: number[] } {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));

  const dates: string[] = [];
  const dayIndices: number[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dates.push(iso);
    dayIndices.push(d.getDay());
  }
  return { dates, dayIndices };
}

function calcCo2(marginMinutes: number): number {
  return Math.round(marginMinutes * 0.06 * 10) / 10;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("getWeekDates", () => {
  it("returns exactly 7 dates", () => {
    const { dates } = getWeekDates();
    expect(dates).toHaveLength(7);
  });

  it("all dates are in YYYY-MM-DD format", () => {
    const { dates } = getWeekDates();
    dates.forEach((d) => expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  });

  it("first date is Monday (dayIndex 1)", () => {
    const { dayIndices } = getWeekDates();
    expect(dayIndices[0]).toBe(1);
  });

  it("last date is Sunday (dayIndex 0)", () => {
    const { dayIndices } = getWeekDates();
    expect(dayIndices[6]).toBe(0);
  });

  it("dates are consecutive", () => {
    const { dates } = getWeekDates();
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diffMs = curr.getTime() - prev.getTime();
      expect(diffMs).toBe(24 * 60 * 60 * 1000);
    }
  });
});

describe("CO₂ calculation", () => {
  it("0 margin minutes = 0 kg CO₂", () => {
    expect(calcCo2(0)).toBe(0);
  });

  it("10 margin minutes = 0.6 kg CO₂", () => {
    expect(calcCo2(10)).toBe(0.6);
  });

  it("120 margin minutes = 7.2 kg CO₂", () => {
    expect(calcCo2(120)).toBe(7.2);
  });

  it("result is rounded to 1 decimal", () => {
    const result = calcCo2(7); // 7 * 0.06 = 0.42 → 0.4
    expect(result).toBe(0.4);
  });

  it("CO₂ scales linearly with margin minutes", () => {
    const base = calcCo2(10);
    const double = calcCo2(20);
    expect(double).toBeCloseTo(base * 2, 1);
  });
});

describe("DAY_LABELS", () => {
  it("has 7 entries", () => {
    expect(DAY_LABELS).toHaveLength(7);
  });

  it("index 0 is Dom (Sunday)", () => {
    expect(DAY_LABELS[0]).toBe("Dom");
  });

  it("index 1 is Lun (Monday)", () => {
    expect(DAY_LABELS[1]).toBe("Lun");
  });
});

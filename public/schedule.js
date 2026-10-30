// ============================================================
//  SETTINGS — edit here to change the rotation
//  (names and emails are NOT here: they live in the .env file)
// ============================================================
export const CONFIG = {
  // Any date in a week when PERSON_1 cleans.
  // The rotation continues from there automatically (weeks start on Monday).
  startDate: "2026-10-26",

  // Time zone of the house (decides "which week is it today")
  timeZone: "Europe/Athens",

  // What needs to be done each week (shown on the site and in the email)
  tasks: [
    "Bathroom: sink, toilet, shower and mirror",
    "Kitchen: stove, counter and sink",
    "Sweep and mop the floors",
    "Take out the trash (organic and recycling)",
    "Common area: hallway",
  ],
};

// ============================================================
//  Rotation logic (no need to touch this)
// ============================================================
const DAY = 24 * 60 * 60 * 1000;

function dateInTimeZone(timeZone, now) {
  // "YYYY-MM-DD" for today in the chosen time zone
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function toUTC(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function mondayOf(ms) {
  const weekday = (new Date(ms).getUTCDay() + 6) % 7; // 0 = Monday
  return ms - weekday * DAY;
}

/**
 * Returns who cleans in a given week.
 * people = list of names, in rotation order
 * offset = 0 → this week, 1 → next week, -1 → last week...
 */
export function getWeek(people, offset = 0, now = new Date()) {
  const today = toUTC(dateInTimeZone(CONFIG.timeZone, now));
  const monday = mondayOf(today) + offset * 7 * DAY;
  const base = mondayOf(toUTC(CONFIG.startDate));
  const n = Math.round((monday - base) / (7 * DAY));
  const total = people.length;
  const index = ((n % total) + total) % total;

  return {
    person: people[index],
    index,
    start: new Date(monday),
    end: new Date(monday + 6 * DAY),
  };
}

export function formatDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function formatRange(week) {
  return `${formatDate(week.start)} – ${formatDate(week.end)}`;
}

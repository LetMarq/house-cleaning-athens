import { getPeople } from "../lib/people.js";
import { buildEmail, sendEmail } from "../lib/reminder.js";
import { CONFIG, hourInTimeZone } from "../public/schedule.js";

// Called automatically by Vercel every Monday (see vercel.json).
// You can also open /api/weekly-reminder?preview=1 in the browser
// to see what the email will look like, without sending anything.

export default async function handler(req, res) {
  const people = getPeople();
  if (people.length === 0) {
    return res
      .status(500)
      .json({ error: "No people configured. Set PERSON_1_NAME, PERSON_2_NAME... in Vercel." });
  }
  const email = buildEmail(people.map((p) => p.name));

  // Preview: doesn't send anything
  if (req.query?.preview) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(email.html);
  }

  // Only Vercel (or someone with the secret) can trigger a send
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Set the CRON_SECRET environment variable in Vercel." });
  }
  if (req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Vercel schedules in UTC and ignores daylight saving time, so vercel.json
  // has two Monday runs (07:00 and 08:00 UTC). Only the one that lands on
  // emailHour in the house's time zone actually sends; the other just skips.
  if (req.headers["x-vercel-cron-schedule"]) {
    const hour = hourInTimeZone();
    if (hour !== CONFIG.emailHour) {
      return res.status(200).json({
        skipped: true,
        reason: `It's ${hour}h in ${CONFIG.timeZone}; the email goes out at ${CONFIG.emailHour}h.`,
      });
    }
  }

  const recipients = people.map((p) => p.email).filter(Boolean);

  try {
    await sendEmail(email, recipients);
    return res.status(200).json({ ok: true, person: email.person, sentTo: recipients.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send the email", detail: err.message });
  }
}

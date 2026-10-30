import { getPeople } from "../lib/people.js";

// Gives the site the names in rotation order.
// Emails are never sent to the browser.
export default function handler(req, res) {
  const names = getPeople().map((p) => p.name);

  if (names.length === 0) {
    return res
      .status(500)
      .json({ error: "No people configured. Set PERSON_1_NAME, PERSON_2_NAME... in Vercel." });
  }

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
  return res.status(200).json({ names });
}

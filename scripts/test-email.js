// Sends a test of the weekly email from your own computer, using the .env file.
//
//   npm run test-email          → sends ONLY to you (GMAIL_USER)
//   npm run test-email -- --all → sends to everyone in the rotation
//
// Nothing here goes to Vercel; it's just for testing.

import { getPeople } from "../lib/people.js";
import { buildEmail, sendEmail } from "../lib/reminder.js";

const sendToAll = process.argv.includes("--all");

const people = getPeople();
if (people.length === 0) {
  console.error("❌ No people found. Check PERSON_1_NAME, PERSON_2_NAME... in your .env file.");
  process.exit(1);
}

const email = buildEmail(people.map((p) => p.name));
const recipients = sendToAll
  ? people.map((p) => p.email).filter(Boolean)
  : [process.env.GMAIL_USER].filter(Boolean);

console.log(`📧 Subject: ${email.subject}`);
console.log(`👉 Sending to: ${recipients.join(", ") || "(nobody)"}`);

try {
  await sendEmail({ ...email, subject: `[TEST] ${email.subject}` }, recipients);
  console.log("✅ Sent! Check the inbox (and the spam folder, just in case).");
} catch (err) {
  console.error(`❌ Failed to send: ${err.message}`);
  if (/Invalid login|Username and Password/i.test(err.message)) {
    console.error(
      "   → Check GMAIL_USER and GMAIL_APP_PASSWORD. Use an app password, not your regular one."
    );
  }
  process.exit(1);
}

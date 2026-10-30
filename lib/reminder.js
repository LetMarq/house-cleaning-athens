import nodemailer from "nodemailer";
import { CONFIG, getWeek, formatRange } from "../public/schedule.js";

// Shared by the weekly job (api/weekly-reminder.js)
// and the local test (scripts/test-email.js).

export function buildEmail(names) {
  const current = getWeek(names, 0);
  const next = getWeek(names, 1);
  const site = process.env.SITE_URL;

  const subject = `🧹 This week it's ${current.person}'s turn!`;

  const tasksHtml = CONFIG.tasks
    .map(
      (t) =>
        `<li style="margin:0 0 8px;padding:10px 14px;background:#fff0f6;border-radius:16px;list-style:none">💗 ${t}</li>`
    )
    .join("");
  const html = `
  <div style="background:#ffe3ef;padding:28px 12px;font-family:'Trebuchet MS',system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
    <div style="max-width:460px;margin:0 auto;background:#ffffff;border-radius:32px;padding:28px 22px;text-align:center;color:#5a2240">
      <p style="font-size:14px;color:#a8668a;margin:0 0 10px">Week of ${formatRange(current)}</p>
      <p style="font-size:16px;color:#a8668a;margin:0">This week it's</p>
      <div style="display:inline-block;margin:10px 0 18px;padding:10px 28px;border-radius:999px;background:#ff4f9a;color:#ffffff;font-size:34px;font-weight:bold">${current.person}</div>
      <p style="margin:0 0 10px;font-weight:bold;text-align:left">To do:</p>
      <ul style="padding:0;margin:0 0 18px;text-align:left">${tasksHtml}</ul>
      <p style="margin:0 0 6px;color:#a8668a">Next week: <strong style="color:#5a2240">${next.person}</strong></p>
      ${
        site
          ? `<p style="margin:18px 0 0"><a href="${site}" style="display:inline-block;padding:10px 22px;border-radius:999px;background:#ffd0e4;color:#5a2240;text-decoration:none;font-weight:bold">See the full rotation 💗</a></p>`
          : ""
      }
    </div>
  </div>`;

  const text =
    `This week (${formatRange(current)}) it's ${current.person}'s turn.\n\n` +
    `To do:\n${CONFIG.tasks.map((t) => `- ${t}`).join("\n")}\n\n` +
    `Next week: ${next.person}` +
    (site ? `\n\n${site}` : "");

  return { subject, html, text, person: current.person };
}

export async function sendEmail(email, recipients) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error("Missing variables: GMAIL_USER and/or GMAIL_APP_PASSWORD.");
  }
  if (recipients.length === 0) {
    throw new Error("No recipients. Set PERSON_1_EMAIL, PERSON_2_EMAIL...");
  }

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  await transport.sendMail({
    from: `"House Cleaning" <${GMAIL_USER}>`,
    to: recipients,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}

# 🫧 House Cleaning

A cute little site that shows whose week it is to clean in a weekly rotation, and emails everyone **every Monday at 10 AM** (Athens time) with whose turn it is.

## Structure

```
├── public/
│   ├── index.html         ← the site
│   └── schedule.js        ← ⭐ rotation settings (start date, tasks)
├── api/
│   ├── people.js          ← gives the site the names (never the emails)
│   └── weekly-reminder.js ← sends the weekly email
├── lib/
│   ├── people.js          ← reads names and emails from the .env
│   └── reminder.js        ← builds and sends the email
├── scripts/
│   └── test-email.js      ← sends a test email from your computer
├── vercel.json            ← schedules the send (every Monday)
├── package.json
├── .env                   ← 🔒 your real names/emails (never goes to GitHub)
└── .env.example           ← template for the secret variables
```

## Changing the rotation

**Names and emails** live only in environment variables (`.env` on your computer, and Environment Variables on Vercel), never in the code:

```
PERSON_1_NAME=...    PERSON_1_EMAIL=...
PERSON_2_NAME=...    PERSON_2_EMAIL=...
PERSON_3_NAME=...    PERSON_3_EMAIL=...
```

The numbers are the rotation order. To add someone, create `PERSON_4_NAME` / `PERSON_4_EMAIL`.

The rest is at the top of `public/schedule.js`:

- `startDate` — any day in a week when **PERSON_1** cleans. Right now that's the week of Oct 26 – Nov 1, 2026, so PERSON_2 starts on Nov 2. If that's not right, change the date.
- `tasks` — the list shown on the site and in the email.

---

## Getting it online

### 1. Push to GitHub (from VS Code)

1. Open this folder in VS Code (**File → Open Folder**).
2. Open the **Source Control** panel (branch icon on the side, or `Ctrl+Shift+G`).
3. Click **Publish to GitHub** → pick **Private** (recommended) → confirm.

> VS Code creates the repository and the first commit for you. Sign in to GitHub if it asks.

### 2. Create a Gmail app password

The email is sent from one of your Gmail accounts. Google requires an "app password" (don't use your regular password):

1. Turn on **2-Step Verification** on your Google account, if it isn't already.
2. Go to <https://myaccount.google.com/apppasswords>.
3. Create a password named "House Cleaning" and copy the 16 characters.

### 3. Host it on Vercel

1. Sign in at <https://vercel.com> with your GitHub account.
2. **Add New → Project** → pick the repository → **Import**.
3. Fill in the `.env` file in this folder (emails, Gmail, app password, secret).
4. Before clicking Deploy, open **Environment Variables**, copy the **whole content** of your `.env` and paste it into the first "Key" field — Vercel splits it into all the variables automatically.

| Name | Value |
|---|---|
| `PERSON_1_NAME` … `PERSON_3_NAME` | the names, in rotation order |
| `PERSON_1_EMAIL` … `PERSON_3_EMAIL` | each person's email |
| `GMAIL_USER` | the Gmail that sends the emails (e.g. `you@gmail.com`) |
| `GMAIL_APP_PASSWORD` | the 16-letter app password (no spaces) |
| `CRON_SECRET` | any long random text |
| `SITE_URL` | (optional) the site's address, e.g. `https://house-cleaning.vercel.app` |

5. Click **Deploy**. The site is live. 🎉

> If you add or change variables later, go to **Deployments → ⋯ → Redeploy** so they take effect.

### 4. Testing the email

**From your computer (before or after publishing).** You need [Node.js](https://nodejs.org) 20.6 or newer and a filled-in `.env`. In the VS Code terminal (`Ctrl+'`):

```
npm install
npm run test-email
```

That sends a `[TEST]` email **only to you** (the `GMAIL_USER`). When it looks good, you can send the test to everyone:

```
npm run test-email -- --all
```

**On the published site:**

- **See what it looks like, without sending:** open `https://YOUR-SITE.vercel.app/api/weekly-reminder?preview=1`
- **Send a real one right now (to everyone):** in the VS Code terminal, replacing the secret and the address:
  ```
  curl.exe -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR-SITE.vercel.app/api/weekly-reminder
  ```
  (The **Run** button under **Settings → Cron Jobs** works too, but outside Monday 10h it will just answer "skipped".)

## Notes

- **About the time:** Vercel schedules in UTC and ignores daylight saving time, while Athens is UTC+2 in winter and UTC+3 in summer. So `vercel.json` has two Monday runs, at 07:00 and 08:00 UTC, and the code only sends on the one that is 10h in Athens (`emailHour` in `public/schedule.js`). The other run just skips — that's why you'll see one "skipped" in the logs every Monday.
- On Vercel's free (Hobby) plan, each run can fire anytime within its hour, so the email arrives between 10:00 and 10:59.
- To change the time, edit `emailHour` and move both UTC hours in `vercel.json` (they should be `emailHour − 3` and `emailHour − 2`).
- Names and emails live only in `.env` (ignored by Git) and in Vercel's variables — nothing personal goes to GitHub. The names do show up on the site itself (that's its job), but emails never leave the server.
- The checklist on the site is saved only in the browser of whoever ticked it, and resets every week.

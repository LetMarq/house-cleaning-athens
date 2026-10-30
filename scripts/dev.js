// Runs the site on your own computer, no Vercel needed:
//
//   npm run dev   → open http://localhost:3000
//
// It serves the files in public/ and runs the functions in api/,
// using the variables from your .env file. Nothing is sent by email
// unless you call /api/weekly-reminder with the CRON_SECRET.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const API = path.join(ROOT, "api");
const PORT = Number(process.env.PORT) || 3000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

// Adds the helpers Vercel functions use: res.status(), res.json(), res.send()
function vercelStyle(req, res, url) {
  req.query = Object.fromEntries(url.searchParams);
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(body));
    return res;
  };
  res.send = (body) => {
    res.end(body);
    return res;
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  try {
    // /api/xyz → api/xyz.js
    if (pathname.startsWith("/api/")) {
      const file = path.join(API, `${pathname.slice(5)}.js`);
      if (!file.startsWith(API) || !fs.existsSync(file)) {
        res.statusCode = 404;
        return res.end("Not found");
      }
      // ?t=... so changes to the API are picked up without restarting
      const mod = await import(`${pathToFileURL(file).href}?t=${Date.now()}`);
      vercelStyle(req, res, url);
      return await mod.default(req, res);
    }

    // Everything else → files in public/
    const file = path.join(PUBLIC, pathname === "/" ? "index.html" : pathname);
    if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.statusCode = 404;
      return res.end("Not found");
    }
    res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-store");
    fs.createReadStream(file).pipe(res);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end("Server error — see the terminal");
  }
});

server.listen(PORT, () => {
  console.log(`\n🫧 House Cleaning running at http://localhost:${PORT}`);
  console.log(`   Email preview: http://localhost:${PORT}/api/weekly-reminder?preview=1`);
  console.log("   Press Ctrl+C to stop.\n");
});

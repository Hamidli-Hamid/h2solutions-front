// Entry point for the cPanel "Setup Node.js App" screen (Passenger runs a .js
// file, it cannot run `next start` directly). Copied verbatim into front-build/
// by scripts/build-deploy.sh — edit it here, not there.
const { createServer } = require("http");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, hostname, () => {
    console.log(`> ready on http://${hostname}:${port}`);
  });
});

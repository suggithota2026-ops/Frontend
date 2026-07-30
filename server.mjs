import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";
import sirv from "sirv";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const dist = join(__dirname, "dist");
const port = Number(process.env.PORT) || 8081;
const isProd = process.env.NODE_ENV === "production";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const sirvHandler = sirv(dist, {
  dev: !isProd,
  etag: true,
  maxAge: isProd ? 31536000 : 0,
  immutable: isProd,
  setHeaders(res, pathname) {
    if (pathname.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-cache");
      return;
    }
    if (/\.(js|css|woff2)$/.test(pathname)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return;
    }
    if (/\.(webp|jpg|jpeg|png|svg|ico)$/.test(pathname)) {
      res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
    }
  },
});

const compress = compression();

createServer((req, res) => {
  compress(req, res, () => {
    sirvHandler(req, res, () => {
      const indexPath = join(dist, "index.html");
      if (req.method === "GET" && existsSync(indexPath)) {
        const html = readFileSync(indexPath);
        res.writeHead(200, {
          "Content-Type": mimeTypes[".html"],
          "Cache-Control": "no-cache",
        });
        res.end(html);
        return;
      }
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    });
  });
}).listen(port, () => {
  console.log(`Suggi Thota site running on http://localhost:${port}`);
});

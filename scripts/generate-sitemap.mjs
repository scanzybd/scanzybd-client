/**
 * Build sitemap.xml from static routes + live product IDs from the API.
 */
import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const siteUrl = (process.env.VITE_SITE_URL || "https://scanzybd.com").replace(/\/$/, "");
const apiBase = (process.env.VITE_API_BASE_URL || "https://scanzybd-server.vercel.app").replace(
  /\/$/,
  ""
);

const staticRoutes = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/about", changefreq: "monthly", priority: 0.7 },
  { url: "/contact", changefreq: "monthly", priority: 0.7 },
  { url: "/Products", changefreq: "weekly", priority: 0.9 },
  { url: "/product", changefreq: "weekly", priority: 0.8 },
  { url: "/terms-of-use", changefreq: "yearly", priority: 0.5 },
  { url: "/privacy-policy", changefreq: "yearly", priority: 0.5 },
  { url: "/refund-policy", changefreq: "yearly", priority: 0.5 },
  { url: "/shipping-info", changefreq: "yearly", priority: 0.5 },
  { url: "/business-terms", changefreq: "yearly", priority: 0.5 },
  { url: "/faq", changefreq: "yearly", priority: 0.6 },
  { url: "/blog", changefreq: "monthly", priority: 0.4 },
  { url: "/careers", changefreq: "yearly", priority: 0.3 },
  { url: "/partners", changefreq: "yearly", priority: 0.3 },
  { url: "/help-center", changefreq: "monthly", priority: 0.4 },
  { url: "/documentation", changefreq: "monthly", priority: 0.4 },
  { url: "/community", changefreq: "monthly", priority: 0.4 },
];

function normalizeProducts(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.products)) return payload.products;
  return [];
}

async function fetchProductRoutes() {
  try {
    const res = await fetch(`${apiBase}/api/products`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn(`Sitemap: products API returned ${res.status}, skipping dynamic URLs.`);
      return [];
    }
    const data = await res.json();
    return normalizeProducts(data)
      .filter((p) => p?.isActive !== false)
      .map((p) => ({
        url: `/Products/${p._id || p.id}`,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: p.updatedAt || p.createdAt || new Date().toISOString(),
      }));
  } catch (err) {
    console.warn("Sitemap: could not fetch products:", err.message);
    return [];
  }
}

const productRoutes = await fetchProductRoutes();
const links = [...staticRoutes, ...productRoutes];
const now = new Date().toISOString();

const stream = new SitemapStream({ hostname: siteUrl });
const writeStream = createWriteStream(join(publicDir, "sitemap.xml"));

stream.pipe(writeStream);

for (const link of links) {
  stream.write({
    ...link,
    lastmod: link.lastmod || now,
  });
}

stream.end();
await streamToPromise(stream);

console.log(`Sitemap written with ${links.length} URLs (${productRoutes.length} products).`);

// scripts/buildFullHymns.js
import fs from "fs";
import path from "path";
import { hymns } from "../app/lib/hymns.js";

// Read hymnUrls.json manually (no import assertion)
const hymnUrls = JSON.parse(fs.readFileSync("./hymnUrls.json", "utf8"));

const combined = {};

for (const [num, title] of Object.entries(hymns)) {
  const url = hymnUrls[num] || null;
  combined[num] = { title, url };
}

// Sort numerically
const sorted = Object.keys(combined)
  .sort((a, b) => Number(a) - Number(b))
  .reduce((acc, key) => {
    acc[key] = combined[key];
    return acc;
  }, {});

const outPath = path.resolve("./app/lib/hymnsFull.js");
fs.writeFileSync(
  outPath,
  `// ⚙️ Auto-generated file combining hymn titles + URLs\n\nexport const hymnsFull = ${JSON.stringify(
    sorted,
    null,
    2
  )};\n`
);

console.log(`✅ Created ${outPath} with ${Object.keys(sorted).length} entries`);

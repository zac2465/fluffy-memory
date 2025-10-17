// scripts/verifyNormalHymns.js
import fs from "fs";
import fetch from "node-fetch";
import { hymns } from "../app/lib/hymns.js";

const verified = {};
const failed = {};

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
      redirect: "follow",
    });

    // A 200 OK with the hymn slug in the final URL = likely valid
    if (res.ok && res.url.includes("/study/music/hymns-for-home-and-church/")) {
      return true;
    }
  } catch (err) {
    // ignore
  }
  return false;
}

async function main() {
  console.log("🔎 Checking normal hymn URLs only (no release-3)...\n");

  for (const [num, title] of Object.entries(hymns)) {
    const slug = slugifyTitle(title);

    // Only check hymns 500 and above (the newer ones)
    const url = `https://www.churchofjesuschrist.org/study/music/hymns-for-home-and-church/${slug}?lang=eng`;

    const ok = await checkUrl(url);
    if (ok) {
      console.log(`${num} ✅ ${url}`);
      verified[num] = url;
    } else {
      console.log(`${num} ❌ ${url}`);
      failed[num] = url;
    }
  }

  fs.writeFileSync("./verifiedHymnUrls.json", JSON.stringify(verified, null, 2));
  fs.writeFileSync("./failedHymnUrls.json", JSON.stringify(failed, null, 2));

  console.log(`\n✅ Done. Saved ${Object.keys(verified).length} verified hymns.`);
  console.log(`❌ ${Object.keys(failed).length} failed hymns (check manually or add release-3).`);
}

main();

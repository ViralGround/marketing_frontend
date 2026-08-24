import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const bundleRoot = join(process.cwd(), ".next", "static");
const forbidden = [
  ["Demo", "Login"].join(""),
  [".demo", "@viralground.local"].join(""),
];

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(path) : [path];
    }),
  );
  return nested.flat();
}

const files = (await filesBelow(bundleRoot)).filter((path) => /\.(?:js|map)$/.test(path));
const violations = [];

for (const file of files) {
  const source = await readFile(file, "utf8");
  for (const fragment of forbidden) {
    if (source.includes(fragment)) violations.push(`${file}: ${fragment}`);
  }
}

if (violations.length > 0) {
  throw new Error(`Forbidden demo credentials found in production assets:\n${violations.join("\n")}`);
}

console.log(`Checked ${files.length} production client assets: no demo credentials found.`);

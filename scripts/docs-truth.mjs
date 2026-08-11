// The docs are claims about the repo, so the repo gets to grade them.
// Zero-dependency by design — it must run before pnpm install in any CI job.
import { readFileSync, readdirSync, existsSync } from "node:fs";

let failures = 0;
const fail = (m) => { failures++; console.error("FAIL:", m); };

// ADRs: sequential, indexed.
const adrs = readdirSync("docs/decisions").filter((f) => /^\d{4}-/.test(f)).sort();
adrs.forEach((f, i) => { if (parseInt(f.slice(0, 4), 10) !== i + 1) fail(`ADR numbering broken at ${f}`); });
const index = readFileSync("docs/decisions/README.md", "utf8");
for (const f of adrs) if (!index.includes(`| ${f.slice(0, 4)} |`)) fail(`ADR ${f.slice(0, 4)} missing from the index`);

// Every architecture doc an ADR points at must exist — a decision whose
// design document vanished is a decision nobody can re-derive.
for (const f of adrs) {
  const body = readFileSync(`docs/decisions/${f}`, "utf8");
  for (const m of body.matchAll(/`(architecture\/[A-Z0-9_]+\.md)`/g)) {
    if (!existsSync(`docs/${m[1]}`)) fail(`${f} references docs/${m[1]}, which does not exist`);
  }
}

// The docs index must mention every top-level docs/ section, so a new
// section cannot be invisible to the map.
const sections = readdirSync("docs", { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const map = readFileSync("docs/README.md", "utf8");
for (const s of sections) if (!map.includes(s)) fail(`docs/${s}/ exists but docs/README.md does not mention it`);

if (failures) { console.error(`\n${failures} doc-truth failure(s)`); process.exit(1); }
console.log("docs-truth: all claims match the repo");

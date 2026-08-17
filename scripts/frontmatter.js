/**
 * frontmatter.js
 * Minimal YAML-frontmatter parser (no external dependencies).
 * Supports the subset of YAML our incident files actually use:
 * strings, numbers, booleans, flow lists [a, b, c], and simple
 * block lists (dash-prefixed lines).
 *
 * This intentionally avoids pulling in a full YAML library so the
 * project has zero npm dependencies — easier to run in CI, and one
 * less thing that can break on you.
 */

function parseScalar(raw) {
  let v = raw.trim();
  if (v === "") return "";
  if (v === "true") return true;
  if (v === "false") return false;
  if (!isNaN(Number(v)) && v !== "") return Number(v);
  // strip matching quotes
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function parseFlowList(raw) {
  // [a, b, c]
  const inner = raw.trim().replace(/^\[/, "").replace(/\]$/, "");
  if (inner.trim() === "") return [];
  return inner.split(",").map(s => parseScalar(s.trim()));
}

function parseFrontmatter(text) {
  const data = {};
  const lines = text.split("\n");
  let i = 0;
  let currentKey = null;
  let currentList = null;

  while (i < lines.length) {
    const line = lines[i];

    // block list item: "  - value"
    const listItemMatch = line.match(/^\s+-\s+(.*)$/);
    if (listItemMatch && currentKey) {
      currentList = currentList || [];
      currentList.push(parseScalar(listItemMatch[1]));
      data[currentKey] = currentList;
      i++;
      continue;
    }

    // key: value  (value may be empty, meaning a block list follows)
    const kvMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const rawValue = kvMatch[2];
      currentKey = key;
      currentList = null;

      if (rawValue.trim() === "") {
        // could be start of a block list — leave currentList to be filled
        data[key] = [];
        currentList = data[key];
      } else if (rawValue.trim().startsWith("[")) {
        data[key] = parseFlowList(rawValue);
      } else {
        data[key] = parseScalar(rawValue);
      }
    }
    i++;
  }

  return data;
}

/**
 * Splits a file's raw text into { data, content } — mirrors the
 * gray-matter API just enough for our build scripts.
 */
function matter(raw) {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!fmMatch) return { data: {}, content: raw };
  const [, fmText, body] = fmMatch;
  return { data: parseFrontmatter(fmText), content: body };
}

module.exports = { matter };

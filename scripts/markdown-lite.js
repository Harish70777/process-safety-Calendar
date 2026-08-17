/**
 * markdown-lite.js
 * Converts the specific, limited Markdown subset used in our incident
 * files (## headings, - bullets, 1. numbered lists, **bold**, plain
 * paragraphs) into HTML. Not a general-purpose Markdown parser —
 * deliberately narrow to match exactly what incidents/*.md files use.
 */

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(text) {
  // **bold** -> <strong>bold</strong>
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function mdToHtml(md) {
  const lines = md.split("\n");
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    // ## Heading
    if (line.startsWith("## ")) {
      html += `<h2>${inline(line.slice(3).trim())}</h2>\n`;
      i++;
      continue;
    }

    // Bullet list block
    if (line.startsWith("- ")) {
      html += "<ul>\n";
      while (i < lines.length && lines[i].startsWith("- ")) {
        html += `  <li>${inline(lines[i].slice(2).trim())}</li>\n`;
        i++;
      }
      html += "</ul>\n";
      continue;
    }

    // Numbered list block
    if (/^\d+\.\s/.test(line)) {
      html += "<ol>\n";
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        html += `  <li>${inline(lines[i].replace(/^\d+\.\s/, "").trim())}</li>\n`;
        i++;
      }
      html += "</ol>\n";
      continue;
    }

    // Plain paragraph — collect until blank line or a block starter
    let para = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("- ") &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    html += `<p>${inline(para.join(" ").trim())}</p>\n`;
  }

  return html;
}

module.exports = { mdToHtml };

# Process Safety Calendar

A subscribable calendar of historical process safety incidents. Subscribe once
in Google Calendar, Apple Calendar, or Outlook — your calendar app reminds you
natively on each incident's anniversary, with root causes and lessons learned.

## How it works

```
incidents/*.md  →  build-index.js  →  index.json  →  build-ics.js   → site/calendar.ics
                                                    →  build-site.js → site/index.html
```

1. Each incident lives as a Markdown file with structured frontmatter in `/incidents/`.
2. `npm run build` runs all three scripts in sequence:
   - `build-index.js` validates every incident file and writes `index.json`, plus `index-report.txt` (data quality + coverage report).
   - `build-ics.js` generates `site/calendar.ics` — one yearly-recurring event per published incident.
   - `build-site.js` injects an archive card for every published incident into `site/index.html`.
3. A GitHub Actions workflow (`.github/workflows/build-and-deploy.yml`) runs this automatically on every push to `main` and deploys `/site` to GitHub Pages. The build fails if any incident is missing required fields.

No database, no server, no cron job to maintain — GitHub is the database and the automation.

## Adding an incident

See `sources-checklist.md` for the full backlog and instructions. Short version:
copy an existing file in `/incidents/`, fill in the frontmatter, set
`status: published`, commit, push.

## Local development

```
npm run build        # run the full pipeline
npm run build:index  # just re-validate and rebuild index.json
npm run build:ics    # just rebuild the calendar file
npm run build:site   # just re-inject archive cards into index.html
```

Then open `site/index.html` directly, or serve it locally:

```
cd site && python3 -m http.server 8080
```

## Deployment (GitHub Pages)

1. Push this repo to GitHub.
2. Repo Settings → Pages → Source: "GitHub Actions."
3. Push to `main` — the workflow builds and deploys automatically.
4. Replace `SITE_URL` in `scripts/build-ics.js` and the subscribe links in
   `site/index.html` with your actual domain once you have one.

# Wedding website

A clean, self-hosted wedding site with no build step and one config file. Data lives in SQLite.

Pages:

- Home with countdown and add-to-calendar
- Our story
- Wedding party
- Schedule
- Travel and accommodations
- Registry
- FAQ
- Photo gallery
- Guest RSVP with per-event responses, meal choices, and plus-ones
- Private admin dashboard with guest list and CSV import/export

An optional site-wide password is also available.

## Run it

```bash
npm install
cp .env.example .env      # set ADMIN_PASSWORD (and optionally SITE_PASSWORD)
npm run seed              # demo guest list, optional
npm start                 # http://localhost:4400
```

`npm run dev` restarts on file changes.

## Make it yours

- **Content** is in `site.config.js`. Names, dates, venue, page headings, and every page's text live there. Templates only hold generic labels such as "Schedule" and "RSVP".
- **Photos** go in `public/images/`. Missing files fall back to a soft placeholder.
- **Guest list** is managed in `/admin`. Add households by hand or paste a CSV at `/admin/import`.
- **RSVP events** are the schedule entries with `rsvp: true`. Add `meal: true` to ask for an entrée.
- **Site password** is enabled by setting `SITE_PASSWORD` in `.env`.

CSV columns for import: `household,first_name,last_name,email,plus_ones,invited_events`.

## How RSVP works

1. A guest searches their name and confirms their household.
2. They accept or decline each event for every person in the party.
3. They pick an entrée where relevant and add a plus-one if their invitation allows one.
4. They leave an email, a song request, and a note.

Searching again lets them edit. Every household has a private link (`/rsvp/<code>`) shown in the admin guest list that you can send directly.

## Layout

```
server.js            Express app
site.config.js       all content
src/db.js            SQLite schema (node:sqlite, no native deps)
src/lib/guests.js    household, guest, and RSVP data access
src/routes/          pages, rsvp, admin
views/               EJS templates
public/              css, js, images
scripts/seed.js      demo data
data/                SQLite file (gitignored)
```

## Going live later

Any Node host with a persistent disk works. Set `SESSION_SECRET` and `ADMIN_PASSWORD`, mount `data/` on a volume, and put it behind HTTPS.

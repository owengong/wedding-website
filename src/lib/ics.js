const site = require('../../site.config');
const fmt = require('./format');

function utcStamp(iso) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeText(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function buildIcs(baseUrl) {
  const w = site.wedding;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//wedding-website//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${utcStamp(w.start)}@${new URL(baseUrl).host}`,
    `DTSTAMP:${utcStamp(new Date().toISOString())}`,
    `DTSTART:${utcStamp(w.start)}`,
    `DTEND:${utcStamp(w.end)}`,
    `SUMMARY:${escapeText(`${fmt.coupleNames()}'s Wedding`)}`,
    `LOCATION:${escapeText(`${w.venue}, ${w.address}`)}`,
    `DESCRIPTION:${escapeText(`Details and RSVP: ${baseUrl}`)}`,
    `URL:${baseUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}

module.exports = { buildIcs };

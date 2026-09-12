const site = require('../../site.config');

const tz = site.timezone || 'UTC';

function part(iso, options) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, ...options }).format(new Date(iso));
}

const fmt = {
  coupleNames() {
    return `${site.couple.partner1.first} & ${site.couple.partner2.first}`;
  },
  coupleFull() {
    const a = site.couple.partner1;
    const b = site.couple.partner2;
    return `${a.first} ${a.last} & ${b.first} ${b.last}`;
  },
  monogram() {
    return `${site.couple.partner1.first[0]}${site.couple.partner2.first[0]}`;
  },
  longDate(iso) {
    return part(iso, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  },
  mediumDate(iso) {
    return part(iso, { month: 'long', day: 'numeric', year: 'numeric' });
  },
  dayDate(iso) {
    return part(iso, { weekday: 'long', month: 'long', day: 'numeric' });
  },
  shortDate(iso) {
    return part(iso, { month: 'short', day: 'numeric' });
  },
  time(iso) {
    return part(iso, { hour: 'numeric', minute: '2-digit' }).replace(':00', '');
  },
  timeRange(startIso, endIso) {
    if (!endIso) return fmt.time(startIso);
    return `${fmt.time(startIso)} – ${fmt.time(endIso)}`;
  },
  dateOnly(yyyyMmDd) {
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(y, m - 1, d));
  },
  mapsUrl(query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  },
  mapsEmbedUrl(query) {
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  },
  rsvpEvents() {
    return site.schedule.filter((e) => e.rsvp);
  },
  eventByKey(key) {
    return site.schedule.find((e) => e.key === key);
  },
  scheduleByDay() {
    const days = new Map();
    for (const ev of site.schedule) {
      const day = fmt.longDate(ev.start);
      if (!days.has(day)) days.set(day, []);
      days.get(day).push(ev);
    }
    return [...days.entries()].map(([day, events]) => ({ day, events }));
  },
  initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  },
};

module.exports = fmt;

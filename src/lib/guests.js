const crypto = require('node:crypto');
const { db, transaction } = require('../db');
const site = require('../../site.config');
const fmt = require('./format');

const CODE_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

function newCode(len = 8) {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return out;
}

function allEventKeys() {
  return fmt.rsvpEvents().map((e) => e.key);
}

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^\p{L}\p{N}\s'-]/gu, '').replace(/\s+/g, ' ').trim();
}

function likeEscape(s) {
  return s.replace(/[\\%_]/g, (m) => `\\${m}`);
}

const selectGuests = db.prepare('SELECT * FROM guests WHERE household_id = ? ORDER BY sort_order, id');
const selectRsvps = db.prepare(
  'SELECT r.guest_id, r.event_key, r.attending FROM rsvps r JOIN guests g ON g.id = r.guest_id WHERE g.household_id = ?'
);

function hydrate(row) {
  if (!row) return null;
  const invited = row.invited_events ? JSON.parse(row.invited_events) : null;
  const validKeys = allEventKeys();
  const guests = selectGuests.all(row.id).map((g) => ({ ...g, rsvps: {} }));
  const byId = new Map(guests.map((g) => [g.id, g]));
  for (const r of selectRsvps.all(row.id)) {
    const g = byId.get(r.guest_id);
    if (g) g.rsvps[r.event_key] = r.attending;
  }
  return {
    ...row,
    invited_events: invited ? invited.filter((k) => validKeys.includes(k)) : validKeys,
    invited_all: !invited,
    guests,
  };
}

function getHouseholdById(id) {
  return hydrate(db.prepare('SELECT * FROM households WHERE id = ?').get(Number(id)));
}

function getHouseholdByCode(code) {
  return hydrate(db.prepare('SELECT * FROM households WHERE code = ?').get(String(code)));
}

function listHouseholds() {
  return db.prepare('SELECT * FROM households ORDER BY name COLLATE NOCASE').all().map(hydrate);
}

function invitedEvents(household) {
  return fmt.rsvpEvents().filter((e) => household.invited_events.includes(e.key));
}

// Guest-facing search. Tries progressively looser matches so "Alice Smith", "alice", "Smith",
// and "Alice S" all land on the right household.
function searchHouseholds(query) {
  const q = norm(query);
  if (q.length < 2) return [];
  const tokens = q.split(' ');
  const hits = (sql, ...params) => db.prepare(sql).all(...params).map((r) => r.household_id);

  let ids = hits(
    `SELECT DISTINCT household_id FROM guests
     WHERE lower(trim(first_name || ' ' || last_name)) LIKE ? ESCAPE '\\'`,
    `%${likeEscape(q)}%`
  );
  if (!ids.length && tokens.length >= 2) {
    ids = hits(
      `SELECT DISTINCT household_id FROM guests
       WHERE lower(first_name) LIKE ? ESCAPE '\\' AND lower(last_name) LIKE ? ESCAPE '\\'`,
      `${likeEscape(tokens[0])}%`,
      `${likeEscape(tokens[tokens.length - 1])}%`
    );
  }
  if (!ids.length && tokens.length === 1) {
    ids = hits(
      `SELECT DISTINCT household_id FROM guests WHERE lower(first_name) = ? OR lower(last_name) = ?`,
      q,
      q
    );
  }
  if (!ids.length) {
    ids = hits(`SELECT id AS household_id FROM households WHERE lower(name) LIKE ? ESCAPE '\\'`, `%${likeEscape(q)}%`);
  }
  return [...new Set(ids)].slice(0, 10).map(getHouseholdById);
}

function cleanGuestList(guests) {
  return (guests || [])
    .map((g) => ({
      id: g.id ? Number(g.id) : null,
      first_name: String(g.first_name || '').trim(),
      last_name: String(g.last_name || '').trim(),
      is_plus_one: g.is_plus_one ? 1 : 0,
    }))
    .filter((g) => g.first_name);
}

function householdFields(input) {
  const keys = allEventKeys();
  let invited = null;
  if (Array.isArray(input.invited_events)) {
    const chosen = input.invited_events.filter((k) => keys.includes(k));
    invited = chosen.length === keys.length ? null : JSON.stringify(chosen);
  }
  return {
    name: String(input.name || '').trim(),
    email: String(input.email || '').trim() || null,
    plus_ones: Math.max(0, Math.min(10, parseInt(input.plus_ones, 10) || 0)),
    invited_events: invited,
    notes: String(input.notes || '').trim() || null,
  };
}

function createHousehold(input) {
  const h = householdFields(input);
  const guests = cleanGuestList(input.guests);
  if (!h.name) throw new Error('Household name is required.');
  if (!guests.length) throw new Error('Add at least one guest.');
  return transaction(() => {
    const code = newCode();
    const res = db
      .prepare('INSERT INTO households (code, name, email, plus_ones, invited_events, notes) VALUES (?, ?, ?, ?, ?, ?)')
      .run(code, h.name, h.email, h.plus_ones, h.invited_events, h.notes);
    const householdId = Number(res.lastInsertRowid);
    const ins = db.prepare('INSERT INTO guests (household_id, first_name, last_name, is_plus_one, sort_order) VALUES (?, ?, ?, ?, ?)');
    guests.forEach((g, i) => ins.run(householdId, g.first_name, g.last_name, g.is_plus_one, i));
    return householdId;
  });
}

function updateHousehold(id, input) {
  const h = householdFields(input);
  const guests = cleanGuestList(input.guests);
  if (!h.name) throw new Error('Household name is required.');
  if (!guests.length) throw new Error('Add at least one guest.');
  transaction(() => {
    db.prepare('UPDATE households SET name = ?, email = ?, plus_ones = ?, invited_events = ?, notes = ? WHERE id = ?').run(
      h.name, h.email, h.plus_ones, h.invited_events, h.notes, Number(id)
    );
    const existingIds = selectGuests.all(Number(id)).map((g) => g.id);
    const keepIds = guests.filter((g) => g.id).map((g) => g.id);
    const del = db.prepare('DELETE FROM guests WHERE id = ? AND household_id = ?');
    for (const gid of existingIds) if (!keepIds.includes(gid)) del.run(gid, Number(id));
    const upd = db.prepare('UPDATE guests SET first_name = ?, last_name = ?, is_plus_one = ?, sort_order = ? WHERE id = ? AND household_id = ?');
    const ins = db.prepare('INSERT INTO guests (household_id, first_name, last_name, is_plus_one, sort_order) VALUES (?, ?, ?, ?, ?)');
    guests.forEach((g, i) => {
      if (g.id && existingIds.includes(g.id)) upd.run(g.first_name, g.last_name, g.is_plus_one, i, g.id, Number(id));
      else ins.run(Number(id), g.first_name, g.last_name, g.is_plus_one, i);
    });
  });
}

function deleteHousehold(id) {
  db.prepare('DELETE FROM households WHERE id = ?').run(Number(id));
}

function clearAll() {
  transaction(() => {
    db.exec('DELETE FROM rsvps; DELETE FROM guests; DELETE FROM households;');
  });
}

// Parses the guest-facing RSVP form and writes it. Returns a list of errors (empty on success).
function saveResponse(household, body) {
  const events = invitedEvents(household);
  const mealOptions = site.rsvp.mealOptions || [];
  const errors = [];
  const answers = [];
  const guestUpdates = [];
  const removals = [];
  const newGuests = [];

  for (const g of household.guests) {
    const update = { id: g.id, meal: null, dietary: String(body[`dietary_${g.id}`] || '').trim() || null };
    if (g.is_plus_one) {
      const first = String(body[`first_${g.id}`] || '').trim();
      const last = String(body[`last_${g.id}`] || '').trim();
      if (!first) { removals.push(g.id); continue; }
      update.first_name = first;
      update.last_name = last;
    }
    let attendsMeal = false;
    for (const ev of events) {
      const v = body[`attending_${g.id}_${ev.key}`];
      if (v !== 'yes' && v !== 'no') {
        errors.push(`Please let us know whether ${g.first_name} will attend ${ev.name}.`);
        continue;
      }
      if (v === 'yes' && ev.meal) attendsMeal = true;
      answers.push({ guestId: g.id, eventKey: ev.key, attending: v === 'yes' ? 1 : 0 });
    }
    if (attendsMeal) {
      const meal = String(body[`meal_${g.id}`] || '');
      if (!mealOptions.includes(meal)) errors.push(`Please choose an entrée for ${update.first_name || g.first_name}.`);
      else update.meal = meal;
    }
    guestUpdates.push(update);
  }

  const usedSlots = household.guests.filter((g) => g.is_plus_one && !removals.includes(g.id)).length;
  const openSlots = Math.max(0, household.plus_ones - usedSlots);
  for (let n = 0; n < openSlots; n++) {
    const first = String(body[`plusone_first_${n}`] || '').trim();
    const last = String(body[`plusone_last_${n}`] || '').trim();
    if (!first) continue;
    const ng = { first_name: first, last_name: last, dietary: String(body[`plusone_dietary_${n}`] || '').trim() || null, meal: null, answers: [] };
    let attendsMeal = false;
    for (const ev of events) {
      const v = body[`plusone_attending_${n}_${ev.key}`];
      if (v !== 'yes' && v !== 'no') {
        errors.push(`Please let us know whether ${first} will attend ${ev.name}.`);
        continue;
      }
      if (v === 'yes' && ev.meal) attendsMeal = true;
      ng.answers.push({ eventKey: ev.key, attending: v === 'yes' ? 1 : 0 });
    }
    if (attendsMeal) {
      const meal = String(body[`plusone_meal_${n}`] || '');
      if (!mealOptions.includes(meal)) errors.push(`Please choose an entrée for ${first}.`);
      else ng.meal = meal;
    }
    newGuests.push(ng);
  }

  if (errors.length) return errors;

  transaction(() => {
    db.prepare('UPDATE households SET email = ?, song_request = ?, message = ?, responded_at = datetime(\'now\') WHERE id = ?').run(
      String(body.email || '').trim() || null,
      String(body.song_request || '').trim() || null,
      String(body.message || '').trim() || null,
      household.id
    );
    const delGuest = db.prepare('DELETE FROM guests WHERE id = ? AND household_id = ?');
    for (const gid of removals) delGuest.run(gid, household.id);

    const updGuest = db.prepare('UPDATE guests SET meal = ?, dietary = ?, first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name) WHERE id = ?');
    for (const u of guestUpdates) updGuest.run(u.meal, u.dietary, u.first_name ?? null, u.last_name ?? null, u.id);

    const upsert = db.prepare(
      `INSERT INTO rsvps (guest_id, event_key, attending, updated_at) VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT (guest_id, event_key) DO UPDATE SET attending = excluded.attending, updated_at = excluded.updated_at`
    );
    for (const a of answers) upsert.run(a.guestId, a.eventKey, a.attending);

    const insGuest = db.prepare('INSERT INTO guests (household_id, first_name, last_name, is_plus_one, dietary, meal, sort_order) VALUES (?, ?, ?, 1, ?, ?, ?)');
    let order = household.guests.length;
    for (const ng of newGuests) {
      const res = insGuest.run(household.id, ng.first_name, ng.last_name, ng.dietary, ng.meal, order++);
      for (const a of ng.answers) upsert.run(Number(res.lastInsertRowid), a.eventKey, a.attending);
    }
  });
  return [];
}

function stats() {
  const households = listHouseholds();
  const events = fmt.rsvpEvents();
  const perEvent = events.map((ev) => ({ key: ev.key, name: ev.name, invited: 0, yes: 0, no: 0, pending: 0 }));
  const meals = new Map((site.rsvp.mealOptions || []).map((m) => [m, 0]));
  const dietary = [];
  let guestCount = 0;
  let responded = 0;

  for (const h of households) {
    if (h.responded_at) responded++;
    for (const g of h.guests) {
      guestCount++;
      if (g.dietary) dietary.push({ name: `${g.first_name} ${g.last_name}`.trim(), household: h.name, note: g.dietary });
      let attendsMeal = false;
      for (const pe of perEvent) {
        if (!h.invited_events.includes(pe.key)) continue;
        pe.invited++;
        const a = g.rsvps[pe.key];
        if (a === 1) { pe.yes++; if (fmt.eventByKey(pe.key).meal) attendsMeal = true; }
        else if (a === 0) pe.no++;
        else pe.pending++;
      }
      if (attendsMeal && g.meal) meals.set(g.meal, (meals.get(g.meal) || 0) + 1);
    }
  }
  return {
    households: households.length,
    responded,
    pendingHouseholds: households.length - responded,
    guests: guestCount,
    perEvent,
    meals: [...meals.entries()].map(([name, count]) => ({ name, count })),
    dietary,
  };
}

function exportRows() {
  const events = fmt.rsvpEvents();
  const header = ['household', 'first_name', 'last_name', 'email', 'plus_ones', 'invited_events', 'is_plus_one',
    ...events.map((e) => `rsvp_${e.key}`), 'meal', 'dietary', 'song_request', 'message', 'responded_at', 'code'];
  const rows = [header];
  for (const h of listHouseholds()) {
    for (const g of h.guests) {
      rows.push([
        h.name, g.first_name, g.last_name, h.email || '', h.plus_ones, h.invited_all ? '' : h.invited_events.join(';'), g.is_plus_one ? 'yes' : '',
        ...events.map((e) => (g.rsvps[e.key] === 1 ? 'yes' : g.rsvps[e.key] === 0 ? 'no' : '')),
        g.meal || '', g.dietary || '', h.song_request || '', h.message || '', h.responded_at || '', h.code,
      ]);
    }
  }
  return rows;
}

// Import format: header row with at least `household,first_name,last_name`.
// Optional columns: email, plus_ones, invited_events (semicolon-separated keys, blank = all).
function importRows(rows) {
  if (!rows.length) throw new Error('No rows found.');
  const header = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const col = (name) => header.indexOf(name);
  const iHousehold = col('household');
  const iFirst = col('first_name') >= 0 ? col('first_name') : col('first');
  const iLast = col('last_name') >= 0 ? col('last_name') : col('last');
  if (iHousehold < 0 || iFirst < 0) throw new Error('Header must include "household" and "first_name".');
  const iEmail = col('email');
  const iPlus = col('plus_ones');
  const iEvents = col('invited_events');

  const groups = new Map();
  for (const r of rows.slice(1)) {
    const name = (r[iHousehold] || '').trim();
    const first = (r[iFirst] || '').trim();
    if (!name || !first) continue;
    if (!groups.has(name)) {
      groups.set(name, {
        name,
        email: iEmail >= 0 ? (r[iEmail] || '').trim() : '',
        plus_ones: iPlus >= 0 ? (r[iPlus] || '0').trim() : '0',
        invited_events: iEvents >= 0 && (r[iEvents] || '').trim() ? r[iEvents].split(';').map((s) => s.trim()) : undefined,
        guests: [],
      });
    }
    groups.get(name).guests.push({ first_name: first, last_name: iLast >= 0 ? r[iLast] || '' : '' });
  }

  let created = 0;
  let appended = 0;
  transaction(() => {
    for (const g of groups.values()) {
      const existing = db.prepare('SELECT id FROM households WHERE lower(name) = lower(?)').get(g.name);
      if (existing) {
        const h = getHouseholdById(existing.id);
        updateHousehold(existing.id, { ...h, invited_events: h.invited_events, guests: [...h.guests, ...g.guests] });
        appended += g.guests.length;
      } else {
        createHousehold(g);
        created++;
      }
    }
  });
  return { created, appended };
}

module.exports = {
  allEventKeys,
  invitedEvents,
  getHouseholdById,
  getHouseholdByCode,
  listHouseholds,
  searchHouseholds,
  createHousehold,
  updateHousehold,
  deleteHousehold,
  clearAll,
  saveResponse,
  stats,
  exportRows,
  importRows,
};

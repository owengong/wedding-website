// Loads a demo guest list so you can click through the RSVP flow and admin.
// Refuses to overwrite an existing list unless run with --force.
require('dotenv').config();
const { db } = require('../src/db');
const guests = require('../src/lib/guests');

const force = process.argv.includes('--force');
const existing = db.prepare('SELECT COUNT(*) AS n FROM households').get().n;
if (existing > 0 && force === false) {
  console.log(`Found ${existing} households already. Re-run with "npm run seed -- --force" to replace them.`);
  process.exit(1);
}

const households = [
  { name: 'The Chen Family', email: 'alice@example.com', plus_ones: 0, guests: [['Alice', 'Chen'], ['Ben', 'Chen']] },
  { name: 'Priya Natarajan', email: 'priya@example.com', plus_ones: 1, guests: [['Priya', 'Natarajan']] },
  { name: 'Sofia & Marco Reyes', email: 'sofia@example.com', plus_ones: 0, guests: [['Sofia', 'Reyes'], ['Marco', 'Reyes']] },
  { name: 'The Okafors', email: 'daniel@example.com', plus_ones: 0, guests: [['Daniel', 'Okafor'], ['Ifeoma', 'Okafor']] },
  { name: 'Tom Whitfield', email: 'tom@example.com', plus_ones: 1, guests: [['Tom', 'Whitfield']] },
  { name: 'Andre Baptiste', email: 'andre@example.com', plus_ones: 1, invited_events: ['ceremony', 'brunch'], guests: [['Andre', 'Baptiste']] },
  { name: 'Margaret & Robert Hart', email: 'mhart@example.com', plus_ones: 0, guests: [['Margaret', 'Hart'], ['Robert', 'Hart']] },
  { name: 'Grace Kim', email: 'grace@example.com', plus_ones: 0, invited_events: ['ceremony'], guests: [['Grace', 'Kim']] },
  { name: 'Luis & Carmen Ortega', email: 'luis@example.com', plus_ones: 0, guests: [['Luis', 'Ortega'], ['Carmen', 'Ortega']] },
  { name: 'Nadia Haddad', email: 'nadia@example.com', plus_ones: 1, guests: [['Nadia', 'Haddad']] },
  { name: 'Jordan & Sam', email: 'jordan@example.com', plus_ones: 0, guests: [['Jordan', 'Whitaker'], ['Sam', 'Lee']] },
  { name: 'Oliver Brandt', email: 'oliver@example.com', plus_ones: 0, invited_events: ['welcome', 'ceremony'], guests: [['Oliver', 'Brandt']] },
];

guests.clearAll();
const ids = households.map((h) =>
  guests.createHousehold({ ...h, guests: h.guests.map(([first_name, last_name]) => ({ first_name, last_name })) })
);

// A few pre-filled responses so the dashboard has something to show.
function respond(householdId, plan) {
  const h = guests.getHouseholdById(householdId);
  const body = { email: h.email, song_request: plan.song || '', message: plan.message || '' };
  h.guests.forEach((g, i) => {
    const p = plan.guests[i] || plan.guests[0];
    const declines = p.no || [];
    for (const key of h.invited_events) body[`attending_${g.id}_${key}`] = declines.includes(key) ? 'no' : 'yes';
    if (p.meal) body[`meal_${g.id}`] = p.meal;
    if (p.dietary) body[`dietary_${g.id}`] = p.dietary;
  });
  if (plan.plusOne) {
    body.plusone_first_0 = plan.plusOne.first;
    body.plusone_last_0 = plan.plusOne.last;
    for (const key of h.invited_events) body[`plusone_attending_0_${key}`] = 'yes';
    body.plusone_meal_0 = plan.plusOne.meal;
  }
  const errors = guests.saveResponse(h, body);
  if (errors.length) throw new Error(`Seed response failed for ${h.name}: ${errors.join(' ')}`);
}

respond(ids[0], { song: 'September by Earth, Wind & Fire', guests: [{ meal: 'Pan-seared salmon' }, { meal: 'Herb-roasted chicken', dietary: 'Tree nut allergy' }] });
respond(ids[1], { guests: [{ meal: 'Wild mushroom risotto (vegetarian)', dietary: 'Vegetarian' }], plusOne: { first: 'Dev', last: 'Natarajan', meal: 'Herb-roasted chicken' } });
respond(ids[2], { message: 'So excited for you both.', guests: [{ meal: 'Herb-roasted chicken', no: ['welcome'] }, { meal: 'Pan-seared salmon', no: ['welcome'] }] });
respond(ids[7], { guests: [{ no: ['ceremony'] }] });

console.log(`Seeded ${households.length} households, 4 with responses.`);

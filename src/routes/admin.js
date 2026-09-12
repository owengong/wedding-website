const express = require('express');
const site = require('../../site.config');
const fmt = require('../lib/format');
const guests = require('../lib/guests');
const csv = require('../lib/csv');
const { safeEqual, cookieOpts, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.admin = true;
  res.locals.layout = 'admin';
  next();
});

router.get('/login', (req, res) => {
  res.render('admin/login', { page: 'admin-login', title: 'Admin', error: null, configured: Boolean(process.env.ADMIN_PASSWORD) });
});

router.post('/login', (req, res) => {
  const configured = Boolean(process.env.ADMIN_PASSWORD);
  if (configured && safeEqual(req.body.password || '', process.env.ADMIN_PASSWORD)) {
    res.cookie('admin', '1', cookieOpts);
    return res.redirect('/admin');
  }
  res.status(401).render('admin/login', { page: 'admin-login', title: 'Admin', error: 'Incorrect password.', configured });
});

router.post('/logout', (req, res) => {
  res.clearCookie('admin');
  res.redirect('/admin/login');
});

router.use(requireAdmin);

router.get('/', (req, res) => {
  res.render('admin/dashboard', { page: 'admin-dashboard', title: 'Dashboard', stats: guests.stats(), events: fmt.rsvpEvents() });
});

router.get('/guests', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const status = String(req.query.status || '');
  let households = guests.listHouseholds();
  if (q) {
    households = households.filter(
      (h) => h.name.toLowerCase().includes(q) || h.guests.some((g) => `${g.first_name} ${g.last_name}`.toLowerCase().includes(q))
    );
  }
  if (status === 'responded') households = households.filter((h) => h.responded_at);
  if (status === 'pending') households = households.filter((h) => !h.responded_at);
  res.render('admin/guests', { page: 'admin-guests', title: 'Guests', households, events: fmt.rsvpEvents(), q, status, flash: req.query.flash || null });
});

function formData(household, error, values) {
  return {
    page: 'admin-household',
    title: household ? 'Edit household' : 'Add household',
    household,
    events: fmt.rsvpEvents(),
    error: error || null,
    values: values || null,
  };
}

router.get('/households/new', (req, res) => res.render('admin/household', formData(null)));

function parseHouseholdForm(body) {
  const firsts = [].concat(body.guest_first || []);
  const lasts = [].concat(body.guest_last || []);
  const ids = [].concat(body.guest_id || []);
  const plus = [].concat(body.guest_plus || []);
  return {
    name: body.name,
    email: body.email,
    plus_ones: body.plus_ones,
    notes: body.notes,
    invited_events: [].concat(body.invited_events || []),
    guests: firsts.map((f, i) => ({ id: ids[i] || null, first_name: f, last_name: lasts[i] || '', is_plus_one: plus[i] === '1' })),
  };
}

router.post('/households', (req, res) => {
  const input = parseHouseholdForm(req.body);
  try {
    const id = guests.createHousehold(input);
    res.redirect(`/admin/households/${id}?flash=Saved`);
  } catch (err) {
    res.status(422).render('admin/household', formData(null, err.message, input));
  }
});

router.get('/households/:id', (req, res) => {
  const household = guests.getHouseholdById(req.params.id);
  if (!household) return res.status(404).send('Not found');
  res.render('admin/household', { ...formData(household), flash: req.query.flash || null });
});

router.post('/households/:id', (req, res) => {
  const household = guests.getHouseholdById(req.params.id);
  if (!household) return res.status(404).send('Not found');
  const input = parseHouseholdForm(req.body);
  try {
    guests.updateHousehold(household.id, input);
    res.redirect(`/admin/households/${household.id}?flash=Saved`);
  } catch (err) {
    res.status(422).render('admin/household', formData(household, err.message, input));
  }
});

router.post('/households/:id/delete', (req, res) => {
  guests.deleteHousehold(req.params.id);
  res.redirect('/admin/guests?flash=Household+deleted');
});

router.get('/export.csv', (req, res) => {
  res.type('text/csv');
  res.set('Content-Disposition', 'attachment; filename="guest-list.csv"');
  res.send(csv.stringify(guests.exportRows()));
});

router.get('/import', (req, res) => {
  res.render('admin/import', { page: 'admin-import', title: 'Import guests', result: null, error: null, events: fmt.rsvpEvents() });
});

router.post('/import', (req, res) => {
  try {
    const result = guests.importRows(csv.parse(req.body.csv || ''));
    res.render('admin/import', { page: 'admin-import', title: 'Import guests', result, error: null, events: fmt.rsvpEvents() });
  } catch (err) {
    res.status(422).render('admin/import', { page: 'admin-import', title: 'Import guests', result: null, error: err.message, events: fmt.rsvpEvents() });
  }
});

module.exports = router;

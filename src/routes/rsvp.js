const express = require('express');
const site = require('../../site.config');
const guests = require('../lib/guests');

const router = express.Router();

function rsvpClosed() {
  if (site.rsvp.open === false) return true;
  if (site.rsvp.deadline) {
    const [y, m, d] = site.rsvp.deadline.split('-').map(Number);
    const end = new Date(y, m - 1, d + 1); // the day after the deadline, local time
    if (new Date() >= end) return true;
  }
  return false;
}

router.get('/', (req, res) => {
  const q = String(req.query.q || '').trim();
  const closed = rsvpClosed();
  if (!q || closed) return res.render('rsvp/lookup', { page: 'rsvp', title: 'RSVP', q, results: null, closed });
  const results = guests.searchHouseholds(q);
  if (results.length === 1) return res.redirect(`/rsvp/${results[0].code}`);
  res.render('rsvp/lookup', { page: 'rsvp', title: 'RSVP', q, results, closed });
});

function loadHousehold(req, res, next) {
  const household = guests.getHouseholdByCode(req.params.code);
  if (!household) return res.status(404).render('error', { page: 'error', title: 'Not found', status: 404, message: 'We could not find that invitation.' });
  req.household = household;
  next();
}

function renderForm(res, household, extra = {}) {
  res.render('rsvp/form', {
    page: 'rsvp',
    title: 'RSVP',
    household,
    events: guests.invitedEvents(household),
    mealOptions: site.rsvp.mealOptions || [],
    openSlots: Math.max(0, household.plus_ones - household.guests.filter((g) => g.is_plus_one).length),
    errors: [],
    values: {},
    ...extra,
  });
}

router.get('/:code', loadHousehold, (req, res) => {
  if (rsvpClosed()) return res.redirect('/rsvp');
  renderForm(res, req.household);
});

router.post('/:code', loadHousehold, (req, res) => {
  if (rsvpClosed()) return res.redirect('/rsvp');
  const errors = guests.saveResponse(req.household, req.body);
  if (errors.length) return res.status(422), renderForm(res, req.household, { errors, values: req.body });
  res.redirect(`/rsvp/${req.household.code}/done`);
});

router.get('/:code/done', loadHousehold, (req, res) => {
  res.render('rsvp/done', {
    page: 'rsvp',
    title: 'Thank you',
    household: req.household,
    events: guests.invitedEvents(req.household),
  });
});

module.exports = router;

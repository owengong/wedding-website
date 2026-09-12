const express = require('express');
const site = require('../../site.config');
const fmt = require('../lib/format');
const { buildIcs } = require('../lib/ics');
const { safeEqual, cookieOpts } = require('../middleware/auth');

const router = express.Router();

const simple = (path, view, title) =>
  router.get(path, (req, res) => res.render(view, { page: view, title }));

router.get('/', (req, res) => res.render('home', { page: 'home', title: null }));
simple('/story', 'story', 'Our Story');
simple('/party', 'party', 'Wedding Party');
simple('/schedule', 'schedule', 'Schedule');
simple('/travel', 'travel', 'Travel & Stay');
simple('/registry', 'registry', 'Registry');
simple('/faq', 'faq', 'Questions');
simple('/photos', 'photos', 'Photos');

router.get('/calendar.ics', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}/`;
  res.type('text/calendar');
  res.set('Content-Disposition', `attachment; filename="${fmt.coupleNames().replace(/[^a-z]/gi, '')}-wedding.ics"`);
  res.send(buildIcs(base));
});

router.get('/gate', (req, res) => {
  if (!process.env.SITE_PASSWORD) return res.redirect('/');
  res.render('gate', { page: 'gate', title: 'Welcome', error: null, next: req.query.next || '/' });
});

router.post('/gate', (req, res) => {
  const next = typeof req.body.next === 'string' && req.body.next.startsWith('/') ? req.body.next : '/';
  if (safeEqual(req.body.password || '', process.env.SITE_PASSWORD || '')) {
    res.cookie('gate', '1', cookieOpts);
    return res.redirect(next);
  }
  res.status(401).render('gate', { page: 'gate', title: 'Welcome', error: 'That password is not quite right.', next });
});

module.exports = router;

require('dotenv').config();
const path = require('node:path');
const express = require('express');
const cookieParser = require('cookie-parser');

const site = require('./site.config');
const fmt = require('./src/lib/format');
const { siteGate } = require('./src/middleware/auth');

const app = express();
const PORT = Number(process.env.PORT) || 4400;
const SECRET = process.env.SESSION_SECRET || 'dev-only-secret-change-me';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.locals.site = site;
app.locals.fmt = fmt;
app.locals.siteGated = Boolean(process.env.SITE_PASSWORD);
app.locals.v = Date.now().toString(36);

app.use(express.static(path.join(__dirname, 'public'), { maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(SECRET));
app.use(siteGate);

app.use('/', require('./src/routes/pages'));
app.use('/rsvp', require('./src/routes/rsvp'));
app.use('/admin', require('./src/routes/admin'));

app.use((req, res) => {
  res.status(404).render('error', { page: 'error', title: 'Not found', status: 404, message: 'That page does not exist.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { page: 'error', title: 'Something went wrong', status: 500, message: 'Something went wrong on our end.' });
});

app.listen(PORT, () => {
  console.log(`${fmt.coupleNames()} wedding site → http://localhost:${PORT}`);
  if (!process.env.ADMIN_PASSWORD) console.log('Note: ADMIN_PASSWORD is not set, so /admin is locked. Copy .env.example to .env.');
});

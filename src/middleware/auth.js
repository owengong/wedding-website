const crypto = require('node:crypto');

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

const cookieOpts = { httpOnly: true, sameSite: 'lax', signed: true, maxAge: 1000 * 60 * 60 * 24 * 30 };

// Optional whole-site password. Off unless SITE_PASSWORD is set.
function siteGate(req, res, next) {
  const pw = process.env.SITE_PASSWORD;
  if (!pw) return next();
  if (req.path === '/gate' || req.path.startsWith('/admin')) return next();
  if (req.signedCookies.gate === '1') return next();
  return res.redirect(`/gate?next=${encodeURIComponent(req.originalUrl)}`);
}

function requireAdmin(req, res, next) {
  if (req.signedCookies.admin === '1') return next();
  return res.redirect('/admin/login');
}

module.exports = { safeEqual, cookieOpts, siteGate, requireAdmin };

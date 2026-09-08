// TutorApp sync server — zero-dependency Node.js (>=18).
// Stores per-account state blobs + parent-portal snapshots + payment notices.
// Runs behind nginx: location /tutor/api/ { proxy_pass http://127.0.0.1:8737/; }
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 8737);
const HOST = process.env.HOST || '127.0.0.1';
const DATA_DIR = process.env.DATA_DIR || '/var/lib/tutorapp';
const MAX_BODY = 4 * 1024 * 1024; // 4 MB, nginx enforces the same
const MAX_NOTICES = 50;

fs.mkdirSync(DATA_DIR, { recursive: true });

const KEY_RE = /^[A-Za-z0-9_-]{12,80}$/;
const TOKEN_RE = /^[A-Za-z0-9_-]{1,80}$/;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,24}$/;
const USERS_PATH_NAME = 'users.json';
const keyHash = key => crypto.createHash('sha256').update(key).digest('hex').slice(0, 40);
const accountPath = key => path.join(DATA_DIR, `acc-${keyHash(key)}.json`);
const tokenIndexPath = path.join(DATA_DIR, 'tokens.json');

const readJson = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
};
const writeJson = (file, value) => {
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(value));
  fs.renameSync(tmp, file);
};

const loadTokenIndex = () => readJson(tokenIndexPath, {});
const saveTokenIndex = idx => writeJson(tokenIndexPath, idx);

const loadAccount = key => readJson(accountPath(key), { state: null, snapshots: {}, notices: {} });
const saveAccount = (key, acc) => writeJson(accountPath(key), acc);

// ── users: email+password → sync key ────────────────────────────────────────
const usersPath = path.join(DATA_DIR, USERS_PATH_NAME);
const loadUsers = () => readJson(usersPath, {});
const saveUsers = users => writeJson(usersPath, users);
const normEmail = email => String(email || '').trim().toLowerCase();
const hashPassword = (password, salt) =>
  crypto.scryptSync(String(password), salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
const passwordOk = (password, user) => {
  const expected = Buffer.from(user.hash, 'hex');
  const actual = Buffer.from(hashPassword(password, user.salt), 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

// simple sliding-window rate limit per IP for auth endpoints
const AUTH_WINDOW_MS = 10 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 20;
const authAttempts = new Map();
const rateLimited = ip => {
  const now = Date.now();
  const rec = authAttempts.get(ip);
  if (!rec || now - rec.ts > AUTH_WINDOW_MS) {
    authAttempts.set(ip, { ts: now, n: 1 });
    return false;
  }
  rec.n += 1;
  if (authAttempts.size > 10000) authAttempts.clear();
  return rec.n > AUTH_MAX_ATTEMPTS;
};
const clientIp = req => String(req.headers['x-real-ip'] || req.socket.remoteAddress || '');

const send = (res, code, body) => {
  const json = JSON.stringify(body);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(json),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store'
  });
  res.end(json);
};

const readBody = req => new Promise((resolve, reject) => {
  let size = 0;
  const chunks = [];
  req.on('data', chunk => {
    size += chunk.length;
    if (size > MAX_BODY) { reject(new Error('body too large')); req.destroy(); return; }
    chunks.push(chunk);
  });
  req.on('end', () => {
    try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
    catch { reject(new Error('bad json')); }
  });
  req.on('error', reject);
});

const handlers = {
  'GET /health': (req, res) => send(res, 200, { ok: true }),

  // Регистрация: связывает email+пароль с ключом синхронизации.
  // key передаёт клиент (его текущий или свежесгенерированный) — так
  // существующие данные пользователя не теряются при создании аккаунта.
  'POST /auth-register': async (req, res) => {
    if (rateLimited(clientIp(req))) return send(res, 429, { ok: false, error: 'too many attempts' });
    const body = await readBody(req);
    const email = normEmail(body.email);
    const password = String(body.password || '');
    const key = String(body.key || '');
    if (!EMAIL_RE.test(email)) return send(res, 400, { ok: false, error: 'bad email' });
    if (password.length < 8 || password.length > 200) return send(res, 400, { ok: false, error: 'bad password' });
    if (!KEY_RE.test(key)) return send(res, 400, { ok: false, error: 'bad key' });
    const users = loadUsers();
    if (users[email]) return send(res, 409, { ok: false, error: 'exists' });
    const salt = crypto.randomBytes(16).toString('hex');
    users[email] = { salt, hash: hashPassword(password, salt), key, createdAt: new Date().toISOString() };
    saveUsers(users);
    send(res, 200, { ok: true, key });
  },

  'POST /auth-login': async (req, res) => {
    if (rateLimited(clientIp(req))) return send(res, 429, { ok: false, error: 'too many attempts' });
    const body = await readBody(req);
    const email = normEmail(body.email);
    const password = String(body.password || '');
    const users = loadUsers();
    const user = users[email];
    if (!user || !passwordOk(password, user)) return send(res, 401, { ok: false, error: 'wrong credentials' });
    send(res, 200, { ok: true, key: user.key });
  },

  'POST /auth-password': async (req, res) => {
    if (rateLimited(clientIp(req))) return send(res, 429, { ok: false, error: 'too many attempts' });
    const body = await readBody(req);
    const email = normEmail(body.email);
    const password = String(body.password || '');
    const newPassword = String(body.newPassword || '');
    if (newPassword.length < 8 || newPassword.length > 200) return send(res, 400, { ok: false, error: 'bad password' });
    const users = loadUsers();
    const user = users[email];
    if (!user || !passwordOk(password, user)) return send(res, 401, { ok: false, error: 'wrong credentials' });
    const salt = crypto.randomBytes(16).toString('hex');
    users[email] = { ...user, salt, hash: hashPassword(newPassword, salt) };
    saveUsers(users);
    send(res, 200, { ok: true });
  },

  'GET /state': (req, res, url) => {
    const key = url.searchParams.get('key') || '';
    if (!KEY_RE.test(key)) return send(res, 400, { ok: false, error: 'bad key' });
    const acc = loadAccount(key);
    send(res, 200, { ok: true, state: acc.state, notices: acc.notices || {} });
  },

  'POST /state': async (req, res) => {
    const body = await readBody(req);
    const key = String(body.key || '');
    if (!KEY_RE.test(key)) return send(res, 400, { ok: false, error: 'bad key' });
    if (!body.state || typeof body.state !== 'object') return send(res, 400, { ok: false, error: 'no state' });
    const acc = loadAccount(key);
    acc.state = body.state;
    acc.snapshots = body.snapshots && typeof body.snapshots === 'object' ? body.snapshots : {};
    // drop acked notices (tutor has merged them into state)
    const ack = new Set((Array.isArray(body.ackNoticeIds) ? body.ackNoticeIds : []).map(String));
    if (ack.size) {
      for (const token of Object.keys(acc.notices || {})) {
        acc.notices[token] = (acc.notices[token] || []).filter(n => !ack.has(String(n.id)));
        if (!acc.notices[token].length) delete acc.notices[token];
      }
    }
    saveAccount(key, acc);
    // keep token → account index in sync
    const hash = keyHash(key);
    const idx = loadTokenIndex();
    let changed = false;
    for (const [token, owner] of Object.entries(idx)) {
      if (owner === hash && !acc.snapshots[token]) { delete idx[token]; changed = true; }
    }
    for (const token of Object.keys(acc.snapshots)) {
      if (TOKEN_RE.test(token) && idx[token] !== hash) { idx[token] = hash; changed = true; }
    }
    if (changed) saveTokenIndex(idx);
    send(res, 200, { ok: true, savedAt: body.state.savedAt || null });
  },

  'GET /parent': (req, res, url, token) => {
    if (!TOKEN_RE.test(token)) return send(res, 400, { ok: false, error: 'bad token' });
    const hash = loadTokenIndex()[token];
    if (!hash) return send(res, 404, { ok: false, error: 'not found' });
    const acc = readJson(path.join(DATA_DIR, `acc-${hash}.json`), null);
    const snapshot = acc && acc.snapshots ? acc.snapshots[token] : null;
    if (!snapshot) return send(res, 404, { ok: false, error: 'not found' });
    send(res, 200, { ok: true, snapshot });
  },

  'POST /parent-notice': async (req, res, url, token) => {
    if (!TOKEN_RE.test(token)) return send(res, 400, { ok: false, error: 'bad token' });
    const hash = loadTokenIndex()[token];
    if (!hash) return send(res, 404, { ok: false, error: 'not found' });
    const file = path.join(DATA_DIR, `acc-${hash}.json`);
    const acc = readJson(file, null);
    if (!acc || !acc.snapshots || !acc.snapshots[token]) return send(res, 404, { ok: false, error: 'not found' });
    const body = await readBody(req);
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) return send(res, 400, { ok: false, error: 'bad amount' });
    const notice = {
      id: body.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amount,
      comment: String(body.comment || '').slice(0, 500),
      status: 'new',
      createdAt: new Date().toISOString()
    };
    acc.notices = acc.notices || {};
    acc.notices[token] = [notice, ...(acc.notices[token] || [])].slice(0, MAX_NOTICES);
    writeJson(file, acc);
    send(res, 200, { ok: true });
  }
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      return res.end();
    }
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 'health' && req.method === 'GET') return handlers['GET /health'](req, res);
    if (parts[0] === 'auth' && parts.length === 2 && req.method === 'POST') {
      const h = handlers[`POST /auth-${parts[1]}`];
      if (h) return await h(req, res);
    }
    if (parts[0] === 'state' && parts.length === 1) {
      if (req.method === 'GET') return handlers['GET /state'](req, res, url);
      if (req.method === 'POST') return await handlers['POST /state'](req, res);
    }
    if (parts[0] === 'parent' && parts.length === 2 && req.method === 'GET') {
      return handlers['GET /parent'](req, res, url, decodeURIComponent(parts[1]));
    }
    if (parts[0] === 'parent' && parts.length === 3 && parts[2] === 'notice' && req.method === 'POST') {
      return await handlers['POST /parent-notice'](req, res, url, decodeURIComponent(parts[1]));
    }
    send(res, 404, { ok: false, error: 'not found' });
  } catch (e) {
    send(res, e.message === 'body too large' ? 413 : 400, { ok: false, error: e.message || 'error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`TutorApp sync server on http://${HOST}:${PORT}, data in ${DATA_DIR}`);
});

const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE  = path.join(__dirname, 'data', 'roomcheck.json');
const THEME_FILE = path.join(__dirname, 'data', 'theme.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function ensureDir() {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function readData() {
  ensureDir();
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch(e) { return { rooms: {}, groups: {}, checkData: {}, roomOrder: [] }; }
}
function writeData(d) {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
}
function readTheme() {
  ensureDir();
  try { return JSON.parse(fs.readFileSync(THEME_FILE, 'utf8')); }
  catch(e) { return null; }
}
function writeTheme(t) {
  ensureDir();
  fs.writeFileSync(THEME_FILE, JSON.stringify(t, null, 2));
}
function isMobile(ua) {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

app.get('/', (req, res) => {
  const ua = req.headers['user-agent'] || '';
  res.sendFile(path.join(__dirname, 'public', isMobile(ua) ? 'mobile.html' : 'index.html'));
});

app.get('/api/data', (req, res) => res.json(readData()));

app.post('/api/data', (req, res) => {
  const { rooms, groups, checkData, roomOrder } = req.body;
  if (!rooms) return res.status(400).json({ error: 'invalid payload' });
  writeData({ rooms, groups: groups||{}, checkData: checkData||{}, roomOrder: roomOrder||[] });
  res.json({ ok: true, savedAt: new Date().toISOString() });
});

app.get('/api/theme', (req, res) => {
  const t = readTheme();
  res.json(t ? { ok: true, theme: t } : { ok: false });
});
app.post('/api/theme', (req, res) => {
  const { theme } = req.body;
  if (!theme) return res.status(400).json({ error: 'invalid payload' });
  writeTheme(theme);
  res.json({ ok: true });
});

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.get('*', (req, res) => {
  const ua = req.headers['user-agent'] || '';
  res.sendFile(path.join(__dirname, 'public', isMobile(ua) ? 'mobile.html' : 'index.html'));
});

app.listen(PORT, () => console.log(`RoomCheck running on port ${PORT}`));

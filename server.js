const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const DB_FILE = path.join(dataDir, 'shopzone.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      products: [],
      admin: { username: 'admin', password: bcrypt.hashSync('admin123', 10) },
      settings: {
        site_name: 'Weelu', tagline: 'Your Marketplace',
        primary_color: '#FF5C00', accent_color: '#FFD600', bg_color: '#0A0A0A',
        hero_title1: 'Everything You Need,', hero_title2: 'One Place to Shop',
        hero_desc: 'Handpicked products from trusted brands plus exclusive deals.',
        premium_price: '₹199'
      },
      nextId: 1
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'weelu-secret-2025', resave: false, saveUninitialized: false, cookie: { maxAge: 86400000 } }));

function requireAuth(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  res.status(401).json({ error: 'Not authenticated' });
}

app.get('/api/products', (req, res) => {
  const db = readDB();
  let products = db.products.filter(p => p.active);
  const { category, search } = req.query;
  if (category && category !== 'All') products = products.filter(p => p.category === category);
  if (search) { const s = search.toLowerCase(); products = products.filter(p => p.name.toLowerCase().includes(s) || (p.description||'').toLowerCase().includes(s) || p.category.toLowerCase().includes(s)); }
  products.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || b.id - a.id);
  res.json(products);
});

app.get('/api/categories', (req, res) => {
  const db = readDB();
  const cats = [...new Set(db.products.filter(p => p.active).map(p => p.category))];
  res.json(['All', ...cats]);
});

app.get('/api/settings', (req, res) => { res.json(readDB().settings); });

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  if (username === db.admin.username && bcrypt.compareSync(password, db.admin.password)) {
    req.session.loggedIn = true; req.session.username = username;
    res.json({ success: true });
  } else { res.status(401).json({ error: 'Wrong username or password' }); }
});

app.post('/api/admin/logout', (req, res) => { req.session.destroy(); res.json({ success: true }); });
app.get('/api/admin/check', (req, res) => { res.json({ loggedIn: !!req.session.loggedIn }); });

app.get('/api/admin/products', requireAuth, (req, res) => {
  const db = readDB();
  res.json([...db.products].sort((a, b) => b.id - a.id));
});

app.post('/api/admin/products', requireAuth, (req, res) => {
  const db = readDB();
  const { name, category, price, old_price, commission, type, emoji, description, link, hot } = req.body;
  const product = { id: db.nextId++, name, category, price, old_price: old_price||'', commission: commission||'', type: type||'affiliate', emoji: emoji||'📦', description: description||'', link: link||'#', hot: !!hot, active: true, created_at: new Date().toISOString() };
  db.products.push(product);
  writeDB(db);
  res.json({ success: true, id: product.id });
});

app.put('/api/admin/products/:id', requireAuth, (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const { name, category, price, old_price, commission, type, emoji, description, link, hot, active } = req.body;
  db.products[idx] = { ...db.products[idx], name, category, price, old_price: old_price||'', commission: commission||'', type: type||'affiliate', emoji: emoji||'📦', description: description||'', link: link||'#', hot: !!hot, active: active=='1'||active===true };
  writeDB(db);
  res.json({ success: true });
});

app.delete('/api/admin/products/:id', requireAuth, (req, res) => {
  const db = readDB();
  db.products = db.products.filter(p => p.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ success: true });
});

app.post('/api/admin/settings', requireAuth, (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json({ success: true });
});

app.post('/api/admin/change-password', requireAuth, (req, res) => {
  const { current, newpass } = req.body;
  const db = readDB();
  if (!bcrypt.compareSync(current, db.admin.password)) return res.status(400).json({ error: 'Current password is wrong' });
  db.admin.password = bcrypt.hashSync(newpass, 10);
  writeDB(db);
  res.json({ success: true });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin-panel', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'index.html')));
app.use('/admin-panel', express.static(path.join(__dirname, 'admin')));

app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Weelu is running on port ' + PORT);
});

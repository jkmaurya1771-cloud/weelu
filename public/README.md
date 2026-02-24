# ShopZone — Setup Guide

## Run on your Windows PC

### Step 1 — Install dependencies
Open the `shopzone` folder, then open a Command Prompt or PowerShell inside it and run:
```
npm install
```

### Step 2 — Start the server
```
npm start
```

### Step 3 — Open your site
- 🌐 Your store: http://localhost:3000
- 🔐 Admin panel: http://localhost:3000/admin-panel
- 👤 Default login: admin / admin123

---

## How to add products
1. Go to http://localhost:3000/admin-panel
2. Login with admin / admin123
3. Click "Add Product" in the sidebar
4. Fill in the details and click "Add Product to Store"
5. It shows on your site INSTANTLY — no re-uploading needed!

---

## Deploy FREE online (Railway.app)

### Step 1
Go to https://railway.app and sign up with GitHub

### Step 2
Click "New Project" → "Deploy from GitHub repo"
Upload your shopzone folder to GitHub first (free)

### Step 3
Railway auto-detects Node.js and deploys it
You get a free URL like: https://shopzone-production.up.railway.app

### Step 4
Set environment variable in Railway:
- NODE_ENV = production

Your site is now live 24/7 — add products from anywhere in the world!

---

## Change your admin password
1. Login to admin panel
2. Click "Change Password" in sidebar
3. Enter current password (admin123) and set a new one

---

## Connect a custom domain
1. Buy domain from GoDaddy / Namecheap
2. In Railway → Settings → Custom Domain
3. Add your domain and follow their DNS instructions
4. Done! Your site works on your own domain

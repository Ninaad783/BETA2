# MedEasy Pharmacy OS — Deployment & Testing Guide 🚀

This guide provides two easy ways to deploy and review MedEasy:
1. **Instant Live Preview (Immediate Testing)**: Open a temporary public HTTPS link to test directly on your phone or share with your team in 30 seconds.
2. **Permanent 100% Free Cloud Deployment**: Host the database (Neon/Supabase), backend API (Render/Railway), and frontend (Vercel) permanently for free.

---

## ⚡ Option 1: Instant Live Preview (30 Seconds)

If your app is already running locally and you want to test it immediately on your mobile phone or share it with reviewers:

### Step 1: Expose Frontend
In your terminal, run:
```bash
npx localtunnel --port 5173
```
*Localtunnel will output a public HTTPS URL (e.g., `https://curvy-fox-12.loca.lt`).*
*(When you open it the first time, click "Click to Submit" to view the app).*

---

## 🌐 Option 2: Permanent Free Cloud Deployment

### 1. Database (Neon.tech or Supabase — Free PostgreSQL)
1. Sign up at [neon.tech](https://neon.tech) (Free Serverless PostgreSQL).
2. Create a new project (e.g., `medeasy-db`).
3. Copy the **Connection String** (`postgres://...`).
4. To initialize all tables and 1,000 master Indian medicines:
   - Either run from your computer:
     ```bash
     cd backend
     DATABASE_URL="your-neon-connection-string" npm run migrate
     ```
   - Or open the Neon SQL Editor, paste the contents of `backend/database/schema.sql`, run it, then paste `backend/database/seed_master_medicines_1000.sql` and run it.

---

### 2. Backend API (Render.com — Free Web Service)
1. Sign up at [render.com](https://render.com) and click **New + > Web Service**.
2. Connect your GitHub repository: `https://github.com/Ninaad783/BETA2.git` (Select branch `beta2` or `BETA2`).
3. Configure the settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. In **Environment Variables**, add:
   - `DATABASE_URL`: *(Your PostgreSQL connection string from Neon)*
   - `JWT_SECRET`: *(Any secret text, e.g. `medeasy-production-secret-key-2026`)*
   - `PORT`: `5000`
5. Click **Deploy Web Service**.
6. Render will provide a live API URL, e.g. `https://medeasy-backend.onrender.com`.

---

### 3. Frontend Web App (Vercel — Free Fast Hosting)
1. Sign up at [vercel.com](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository: `https://github.com/Ninaad783/BETA2.git` (Select branch `beta2` or `BETA2`).
3. Configure project settings:
   - **Root Directory**: Edit and set to `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://medeasy-backend.onrender.com` *(Your Render backend URL)*
5. Click **Deploy**.
6. Vercel will deploy in ~45 seconds and give you a fast global HTTPS domain (e.g., `https://medeasy-pharmacy.vercel.app`).
   *(The included `frontend/vercel.json` automatically handles all SPA router page reloads).*

---

## 🔑 Default Login Credentials
Once deployed, log in using:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Pharmacy Admin / Owner

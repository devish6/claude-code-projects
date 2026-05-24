# MG Kutz Website — Setup Guide

Welcome! This guide walks you through everything needed to get your MG Kutz barbershop website up and running. Don't worry—most of this is just copy-and-paste, and it should only take about 15–20 minutes.

---

## 1. Supabase Setup (Database & Storage)
**Time: ~5 minutes**

Supabase is where all your booking information and barber profiles live. It's free and super easy.

### Step 1: Create a Supabase Project
1. Go to **supabase.com** and sign up (or log in if you already have an account)
2. Click **"New project"** (usually a big green button on the dashboard)
3. Give it a name like `mgkutz` or `MG Kutz Barbershop`
4. Create a database password and **save it somewhere safe** (you won't need it again, but write it down)
5. Click **"Create new project"** and wait about 1 minute for it to be ready (you'll see a spinning loader)

### Step 2: Run the Database Schema
1. Once your project is ready, go to the **SQL Editor** (left sidebar → "SQL Editor")
2. Click **"New query"**
3. Open the file `mg-kutz/supabase-setup.sql` from your computer
4. Copy the entire contents
5. Paste it into the SQL Editor in Supabase
6. Click **"Run"** (or press Cmd+Enter on Mac, Ctrl+Enter on Windows)
7. You should see a green checkmark—your database tables are now set up!

### Step 3: Create the Storage Bucket
1. Go to **Storage** (left sidebar)
2. Click **"New bucket"**
3. Name it exactly: `portfolio-photos`
4. Make sure **"Public bucket"** is toggled **ON** (so barber photos load without needing a login)
5. Click **"Create bucket"**

### Step 4: Grab Your API Keys
1. Go to **Settings** (left sidebar, bottom)
2. Click **API** (if you don't see it, look for "Project Settings" → "API")
3. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
4. Copy the **"anon public"** key (it's a long string starting with `eyJhbGc...`)
5. Open `mg-kutz/js/supabase.js` in your code editor
6. Find these two lines:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
   ```
7. Replace `'YOUR_SUPABASE_URL_HERE'` with your Project URL (keep the quotes)
8. Replace `'YOUR_ANON_KEY_HERE'` with your anon key (keep the quotes)
9. Save the file

**Boom!** Your database is wired up.

---

## 2. Google Calendar Setup (Bookings & Reminders)
**Time: ~5 minutes**

This lets barbers sync their appointments to Google Calendar and clients get booking confirmations.

### Step 1: Create a Google Cloud Project
1. Go to **console.cloud.google.com**
2. At the top, you'll see a dropdown with your project name—click it
3. Click **"New Project"**
4. Name it `MG Kutz` and click **"Create"**
5. Wait a few seconds for the project to load

### Step 2: Enable Google Calendar API
1. At the top of the page, search for **"Calendar API"** (there's a search box)
2. Click the **Calendar API** result
3. Click **"Enable"**
4. You should see a blue checkmark—the API is now on

### Step 3: Create OAuth Credentials
1. Go to **APIs & Services** (left sidebar)
2. Click **Credentials** (left sidebar, under "APIs & Services")
3. Click **"+ Create Credentials"** (top button)
4. Choose **"OAuth client ID"**
5. If prompted to create an OAuth consent screen first, click the blue banner that says **"Create OAuth consent screen"**
   - Choose **External** user type
   - Fill in the app name as `MG Kutz`
   - Enter your email for support
   - Click **"Save and continue"** and skip the optional fields
   - Click **"Save and continue"** again
6. Back to OAuth Client ID:
   - Choose **Web application**
   - Name it `MG Kutz Website`
   - Under **Authorized JavaScript origins**, add:
     - `http://localhost:3000` (for testing)
     - `https://yourusername.github.io` (replace with your actual GitHub username—for live site)
   - Under **Authorized redirect URIs**, add the same two URLs
   - Click **"Create"**
7. Copy the **Client ID** (the long string, not the secret)
8. Open `mg-kutz/js/gcal.js`
9. Find this line:
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';
   ```
10. Replace `'YOUR_GOOGLE_CLIENT_ID_HERE'` with your Client ID (keep the quotes)
11. Save the file

**Done!** Google Calendar is ready to roll.

---

## 3. Adding Barber Accounts
**Time: ~2 minutes per barber**

Each barber needs their own login so they can manage their profile and bookings.

1. Go to your Supabase dashboard
2. Click **Authentication** (left sidebar)
3. Click **Users** (under "Authentication")
4. Click **"Invite user"**
5. Type in the barber's email address
6. Click **"Send invitation"**
7. The barber will get an email—they click the link and set their password
8. Once they log in, they go to `yoursite.com/admin.html`, log in again, and fill out:
   - Their name
   - A bio (optional)
   - Years of experience
   - Specialties (e.g., "Fades, Line-ups, Designs")
9. They upload a profile photo and connect their Google Calendar (the app will guide them)

---

## 4. Deploy to GitHub Pages (Free Hosting)
**Time: ~2 minutes**

Your website is already in a GitHub repository. Let's make it live!

### Step 1: Push Your Changes
1. Open your terminal
2. Navigate to your project folder
3. Run:
   ```bash
   git add .
   git commit -m "Update Supabase and Google Calendar config"
   git push
   ```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub (github.com/yourusername/claude-code-projects)
2. Click **Settings** (top-right area)
3. On the left sidebar, click **Pages**
4. Under **Source**, select **Deploy from a branch**
5. Choose **Branch: main** and **folder: / (root)**
6. Click **Save**
7. Wait about 1 minute—GitHub will build and deploy your site
8. You'll see a green message with your live URL: `https://yourusername.github.io/claude-code-projects/mg-kutz/`

### Step 3: Update Google OAuth URLs
Now that you have your live URL, update Google Console:
1. Go back to **console.cloud.google.com**
2. Go to **APIs & Services** → **Credentials**
3. Click your OAuth app to edit it
4. Under **Authorized JavaScript origins**, add:
   - `https://yourusername.github.io` (replace with your username)
5. Under **Authorized redirect URIs**, add:
   - `https://yourusername.github.io/claude-code-projects/mg-kutz/`
6. Click **Save**

Your site is now live!

---

## 5. Going Live Checklist

Before you tell everyone about your new website, make sure everything works:

- [ ] Supabase URL and anon key are in `js/supabase.js`
- [ ] Google Client ID is in `js/gcal.js`
- [ ] `portfolio-photos` bucket is created and set to Public
- [ ] At least one barber account is created in Supabase Auth
- [ ] You've tested logging in as a barber and filling out a profile
- [ ] You've tested making a booking as a client
- [ ] GitHub Pages shows your site as live (green checkmark on Settings → Pages)
- [ ] Your live site URL works in a browser

---

## Troubleshooting

**Q: "I get an error when I run the SQL"**
A: Make sure you're in the SQL Editor (not the Query builder). Copy the entire file and paste it as-is.

**Q: "I can't log in as a barber"**
A: Check that the barber's email matches the one in Supabase Auth. They should have received an invite email—if not, resend it from the Users page.

**Q: "Photos aren't uploading"**
A: Make sure your `portfolio-photos` bucket is set to **Public** (toggle it in Storage → portfolio-photos → Settings).

**Q: "The site isn't live on GitHub Pages"**
A: Wait 2–3 minutes and refresh. If it still doesn't show, check Settings → Pages and make sure "Deploy from branch" is selected.

---

## Support

If you run into issues, reach out! This setup should be straightforward, but there's a lot of pieces. Double-check that:
1. You've saved all config files (`supabase.js`, `gcal.js`)
2. Your Supabase project shows all three tables (barbers, portfolio_photos, bookings)
3. Your Google OAuth URLs exactly match your GitHub Pages domain

Good luck! Your MG Kutz website is about to be awesome.

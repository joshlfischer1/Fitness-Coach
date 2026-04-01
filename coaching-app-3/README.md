# Hybrid Coach App

Your personal hybrid run/strength coaching app powered by Gemini AI.

---

## Deploy to Vercel in ~10 minutes (no coding required)

### Step 1 — Get your Gemini API Key

1. Go to **aistudio.google.com**
2. Click **Get API Key** in the left sidebar
3. Click **Create API key**
4. Copy the key — you'll paste it into the app on first launch

### Step 2 — Create a free GitHub account (if you don't have one)

Go to **github.com** and sign up. It's free.

### Step 3 — Upload this project to GitHub

1. Go to **github.com/new** to create a new repository
2. Name it `hybrid-coach` (or anything you like)
3. Click **Create repository**
4. Click **uploading an existing file**
5. Drag the entire `coaching-app` folder into the upload area
6. Click **Commit changes**

### Step 4 — Deploy on Vercel

1. Go to **vercel.com** and sign up with your GitHub account (free)
2. Click **Add New Project**
3. Select your `hybrid-coach` repository
4. Vercel will auto-detect it as a React app
5. Click **Deploy**
6. Wait ~2 minutes — Vercel gives you a live URL like `hybrid-coach.vercel.app`

### Step 5 — Open your app

1. Visit your Vercel URL
2. The app will ask for your Gemini API key on first launch
3. Paste it in — it's saved only on your device
4. Fill out the intake form and generate your program

---

## Using the App

**My Program tab**
- Click any week tab to navigate
- Click "Generate Week X" to generate that week's plan
- Weeks are generated on demand and saved automatically
- Use "Regenerate Week" if you want a fresh version

**Pace Calculator tab**
- Enter a recent race result to auto-calculate all pace zones
- Or manually override any pace
- These feed into your running workouts

**Session Log tab**
- Log every session after completing it
- Track fatigue (1–10), miles, PRs, symptom status
- The app flags high fatigue patterns automatically

**Settings tab**
- Update your API key
- Start a new program
- Clear data

---

## Updating the app

If you want to update the app after making changes to the code:
1. Push the changes to your GitHub repository
2. Vercel automatically redeploys — usually within 60 seconds

---

## Troubleshooting

**"Generation failed" error**
- Check your API key in Settings — make sure it's correct
- Make sure you're connected to the internet
- The free Gemini tier allows 1,500 requests/day — you won't hit this with personal use

**App not loading**
- Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache if needed

**Lost my program**
- Data is stored in your browser's localStorage
- Clearing browser data or using a different browser/device will lose it
- To keep data across devices, this would need a database (a future upgrade)

# 🍳 AI Recipe Maker

Transform any list of ingredients into beautiful, diverse recipes from cuisines around the world — powered by a **free AI** (Groq + Llama 3.3).

![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green) ![Python](https://img.shields.io/badge/Python-3.9+-blue) ![Free AI](https://img.shields.io/badge/AI-Groq%20Free%20Tier-orange)

---

## ✨ Features

- 🥘 Enter any ingredients you have at home
- 🌍 Get 3–5 recipes from different world cuisines
- 🎯 Optional cuisine preference filter
- 📋 Ingredients list, step-by-step instructions, prep time, difficulty
- ⚡ Responsive UI with glassmorphic recipe cards
- 🔄 Loading animations and full error handling
- 💸 **Completely free** — uses Groq's free API tier

---

## 🏗️ Project Structure

```
ai-recipe-maker/
│
├── backend/
│   ├── main.py               # FastAPI server & /generate-recipes endpoint
│   ├── recipe_generator.py   # Groq AI integration
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variable template
│
├── frontend/
│   ├── index.html            # Main UI
│   ├── style.css             # Styles (glassmorphism, animations)
│   └── script.js             # Fetch API calls & UI logic
│
├── railway.toml              # Railway deployment config
├── render.yaml               # Render deployment config
├── Procfile                  # Fallback start command
├── README.md
└── .gitignore
```

---

## 🚀 Setup

### Step 1 — Get a Free Groq API Key

1. Go to **https://console.groq.com** and sign up (free, no credit card)
2. Navigate to **Dashboard → API Keys → Create API Key**
3. Copy the key

---

### Step 2 — Clone & Configure

```bash
git clone https://github.com/YOUR_USERNAME/ai-recipe-maker.git
cd ai-recipe-maker/backend

# Create .env from template
cp .env.example .env
```

Edit `backend/.env`:
```env
GROQ_API_KEY=gsk_your_actual_key_here
```

---

### Step 3 — Install & Run Backend

```bash
cd backend

python -m venv venv
source venv/bin/activate      # Mac/Linux
# OR: venv\Scripts\activate   # Windows

pip install -r requirements.txt
python main.py
```

API running at: **http://localhost:8000**

---

### Step 4 — Open Frontend

```bash
cd frontend
python -m http.server 3000
# Open http://localhost:3000
```

Or just double-click `frontend/index.html` to open directly in your browser.

---

## ☁️ Deploy Backend (Free)

### Option A — Railway (Recommended, easiest)

1. Push this repo to GitHub
2. Go to **https://railway.app** → New Project → Deploy from GitHub
3. Select your `ai-recipe-maker` repo
4. Set environment variable: `GROQ_API_KEY = your-key`
5. Railway auto-detects `railway.toml` and deploys ✅

Your backend URL will look like: `https://ai-recipe-maker-api.up.railway.app`

### Option B — Render (Also free)

1. Go to **https://render.com** → New → Web Service
2. Connect your GitHub repo
3. Render auto-detects `render.yaml`
4. Set `GROQ_API_KEY` in the Environment tab
5. Deploy ✅

---

### After Deploying the Backend

Update this line in `frontend/script.js`:

```js
// Change from:
const API_BASE = "http://localhost:8000";

// To your deployed URL:
const API_BASE = "https://your-app.up.railway.app";
```

Then host the frontend anywhere (GitHub Pages, Netlify, Vercel — all free).

---

## 🔌 API Reference

### `POST /generate-recipes`

**Request:**
```json
{
  "ingredients": "tomato, egg, onion, garlic",
  "cuisine_preference": "Italian"
}
```

**Response:**
```json
{
  "recipes": [
    {
      "name": "Shakshuka",
      "cuisine": "Middle Eastern",
      "prep_time": "25 minutes",
      "difficulty": "Easy",
      "description": "Eggs poached in a rich, spiced tomato sauce.",
      "ingredients": ["3 eggs", "2 tomatoes, diced", "1 onion"],
      "instructions": ["Heat oil...", "Add onion...", "..."]
    }
  ]
}
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| `GROQ_API_KEY is not set` | Add your key to `backend/.env` |
| `Connection refused` on frontend | Make sure backend is running on port 8000 |
| CORS error in browser | Backend allows all origins by default — check `API_BASE` in `script.js` |
| Recipes not generating | Check backend terminal logs for error details |

---

## 📄 License

MIT — free to use, modify, and share.

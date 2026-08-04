# 🧠 Surgery Mind Maps

A fully client-side static website for organizing, viewing, and editing surgery mind maps as a medical student. Built with plain HTML/CSS/JS + [mind-elixir](https://github.com/ssshooter/mind-elixir-core) library.

**No backend needed. No npm. No build step. Deployable on GitHub Pages.**

---

## 🚀 How to Run Locally

### Option 1: Simple HTTP Server (Recommended)

Since the site loads JSON files via `fetch()`, you need a local server (not just opening `index.html` directly):

```bash
# Python 3
cd "website for all mindmap"
python -m http.server 8000

# Then open http://localhost:8000
```

```bash
# Node.js (npx, no install needed)
npx -y serve .

# Then open the URL it shows
```

```bash
# VS Code
# Install the "Live Server" extension, then right-click index.html → "Open with Live Server"
```

### Option 2: Direct File Opening

If you just open `index.html` in a browser, the JSON `fetch()` calls may be blocked by CORS.
In this case, the site still works — it uses **localStorage** as primary storage. You just won't load from the JSON files on first visit.

---

## 🌐 How to Deploy to GitHub Pages

1. **Create a GitHub repository** (e.g. `surgery-mind-maps`)
2. **Push this project** to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial surgery mind maps site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/surgery-mind-maps.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - Go to your repo → **Settings** → **Pages**
   - Under "Source", select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**
4. Your site will be live at `https://YOUR_USERNAME.github.io/surgery-mind-maps/`

---

## 📁 Project Structure

```
├── index.html              # Home page — category grid
├── category.html           # Dynamic category page (?cat=liver)
├── viewer.html             # Mind map viewer/editor (?map=liver/anatomy)
├── assets/
│   ├── styles.css          # Design system (dark mode, responsive)
│   └── app.js              # Shared utilities (data loading, modals)
├── data/
│   ├── categories.json     # Master list of all categories
│   ├── liver/
│   │   ├── topics.json     # List of topics for Liver
│   │   ├── anatomy_physiology.json   # Mind map data (mind-elixir format)
│   │   └── pathology.json            # Another mind map
│   ├── gallbladder/
│   │   └── topics.json
│   ├── ...                 # One folder per category
└── README.md
```

---

## 📊 JSON Data Structure

### `data/categories.json`
```json
{
  "categories": [
    { "id": "liver", "name": "Liver", "icon": "🩸" },
    { "id": "gallbladder", "name": "Gallbladder & Biliary Tree", "icon": "💚" }
  ]
}
```

### `data/{category}/topics.json`
```json
{
  "topics": [
    { "id": "anatomy_physiology", "name": "Anatomy & Physiology", "createdAt": "2025-01-15T10:30:00Z" },
    { "id": "pathology", "name": "Pathology", "createdAt": "2025-01-16T14:00:00Z" }
  ]
}
```

### `data/{category}/{topic}.json` (Mind Map Data)

Uses **mind-elixir's native format**:

```json
{
  "nodeData": {
    "id": "root",
    "topic": "Anatomy & Physiology",
    "root": true,
    "children": [
      {
        "topic": "Gross Anatomy",
        "id": "abc123",
        "children": [
          { "topic": "Lobes", "id": "def456", "children": [] },
          { "topic": "Blood Supply", "id": "ghi789", "children": [] }
        ]
      }
    ]
  }
}
```

---

## 📝 How to Add Content

### Method 1: In-App (Recommended)

1. **Add a category**: Click "+ Add New Category" on the home page
2. **Add a topic**: Click a category → Click "+ Add New Topic"
3. **Create a mind map**: Click the topic → Edit in the viewer → It auto-saves to your browser (localStorage)
4. **Export to file**: Click "⬇️ Download JSON" in the viewer → Save the file to `data/{category}/{topic}.json`
5. **Commit to GitHub**: Push the JSON file so it persists across devices

### Method 2: Manually

1. Create a JSON file in `data/{category}/{topic_slug}.json` with mind-elixir format
2. Add an entry to `data/{category}/topics.json`:
   ```json
   { "id": "topic_slug", "name": "Display Name", "createdAt": "2025-01-15T00:00:00Z" }
   ```
3. Commit and push

---

## 🔄 Data Flow & Persistence

```
Browser localStorage  ←→  JSON files in /data/
    (primary)                (fallback/backup)
```

- **localStorage** is the primary data store (instant reads, auto-save)
- **JSON files** serve as fallback for first visit / new devices
- To sync across devices: Export JSON → commit to GitHub → deploy

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | Plain HTML5, CSS3, JavaScript (ES6+) |
| Mind Maps | [mind-elixir](https://github.com/ssshooter/mind-elixir-core) via CDN |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Storage | localStorage (primary) + static JSON files (fallback) |
| Hosting | GitHub Pages (or any static file host) |

---

## 📱 Mobile Support

The site is fully responsive and designed to work on mobile devices.
You can review mind maps between clinical rotations on your phone!

---

## 📄 License

Personal project. Use freely for your own study needs.

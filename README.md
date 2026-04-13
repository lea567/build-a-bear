# Buil a bear

A web application for building and customizing stuffed animals in real-time with voice recording and a cart system

## Features

| Feature | Details |
|---|---|
| **Bear Customization** | 6 bear types, custom fur colors, clothes, hats, accessories, shoes |
| **Real-Time Preview** | SVG layer-based rendering with parallax/3D tilt effect |
| **Color Picker** | Per-bear fur color + per-outfit color via HexColorPicker |
| **Voice Recording** | Browser-based audio recording with waveform visualizer |
| **Save & Load** | Persist builds to MSSQL, reload any saved bear |
| **Cart & Checkout** | Add bears to cart, view price breakdown, checkout flow |
| **Export / Share** | Download bear as PNG, Web Share API |
| **Price System** | Live price calculation (Build-A-Bear style) |
| **Responsive** | Desktop + tablet layouts |

---

## Project Structure

```
bearcreator/
├── package.json                  # Root scripts (run both services)
│
├── backend/
│   ├── server.js                 # Express entry point
│   ├── db.js                     # MSSQL connection & DB init
│   ├── schema.sql                # Full DB schema + sample data
│   ├── .env.example              # Environment variable template
│   ├── package.json
│   ├── routes/
│   │   ├── bears.js              # CRUD + cart endpoints
│   │   └── upload.js             # Audio & image upload endpoints
│   └── uploads/
│       ├── audio/                # Stored voice recordings
│       └── images/               # Exported bear images
│
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.jsx               # Main app + all UI components
        ├── App.css               # Full design system (dark luxury)
        ├── index.js              # React entry
        ├── components/
        │   └── BearSVG.jsx       # SVG bear renderer (all layers)
        ├── context/
        │   └── BearContext.jsx   # Global state (useReducer)
        ├── data/
        │   └── catalog.js        # All items, prices, defaults
        ├── hooks/
        │   └── useVoiceRecorder.js # Web Audio API hook
        └── utils/
            └── api.js            # Axios API client
```

## Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** 9+
- **SQL Server** 2019+ (or SQL Server Express — free)

### 1. Clone & Install

```bash
git clone <repo-url>
cd bearcreator

# Install all dependencies (root + backend + frontend)
npm run install:all
```

---

### 2. Set Up the Database

#### Option A — SQL Server (recommended)

1. Open **SQL Server Management Studio** (SSMS) or **Azure Data Studio**
2. Run the schema script:
   ```sql
   -- Open backend/schema.sql and execute it
   -- This creates BearCreatorDB with all tables and sample data
   ```

#### Option B — SQL Server Express (free)

Download from: https://www.microsoft.com/en-us/sql-server/sql-server-downloads

Then run `backend/schema.sql` via SSMS or `sqlcmd`:
```bash
sqlcmd -S localhost -i backend/schema.sql
```

---

### 3. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
DB_SERVER=localhost          # Your SQL Server hostname
DB_PORT=1433                 # Default SQL Server port
DB_NAME=BearCreatorDB
DB_USER=sa                   # Or your SQL Server user
DB_PASSWORD=YourPassword123! # Your SQL Server password
DB_ENCRYPT=false             # Set true for Azure SQL
DB_TRUST_CERT=true           # Set false in production
NODE_ENV=development
```

> **Tip:** If using Windows Authentication instead of SQL auth, see the `mssql` docs for `trustedConnection: true`.

---

### 4. Run the Application

```bash
# From the root directory — runs backend + frontend simultaneously
npm run dev
```

Or run separately:

```bash
# Terminal 1 — Backend API (port 3001)
cd backend && npm run dev

# Terminal 2 — React frontend (port 3000)
cd frontend && npm start
```

Open **http://localhost:3000**

---

### 5. Verify Backend

```bash
curl http://localhost:3001/health
# → {"status":"ok","timestamp":"..."}

curl http://localhost:3001/bears
# → {"bears":[...sample bears...]}
```

---

## API Reference

### Bears

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/bears` | List all saved bears |
| `POST` | `/bears` | Save a new bear build |
| `GET` | `/bears/:id` | Load a specific bear |
| `PUT` | `/bears/:id` | Update a bear |
| `DELETE` | `/bears/:id` | Delete a bear |
| `POST` | `/bears/:id/cart` | Add bear to cart |
| `GET` | `/bears/cart/all` | Get cart with bear details |

### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload/audio` | Upload audio recording |
| `POST` | `/upload/image` | Upload bear snapshot |
| `DELETE` | `/upload/audio/:filename` | Delete audio file |

### Static Files

Uploaded files are served at:
- `http://localhost:3001/uploads/audio/<filename>`
- `http://localhost:3001/uploads/images/<filename>`

---

### POST /bears — Request Body

```json
{
  "name": "My Bear",
  "bearType": "classic",
  "bearColor": "#C4956A",
  "config": {
    "bearType": "classic",
    "bearColor": "#C4956A",
    "clothes": "dress_pink",
    "clothesColor": "#FBB6CE",
    "hat": "crown",
    "accessories": "glasses_round",
    "shoes": "heels_pink",
    "name": "My Bear"
  },
  "audioFile": "audio_abc123.webm",
  "totalPrice": 91.00
}
```

---

## Customization Catalog

### Bear Types (6)
`classic` · `fluffy` · `dark` · `polar` · `panda` · `honey`

### Clothes (14)
T-shirts (5 colors) · Dresses (3) · Overalls (2) · Hoodies (2) · Suit

### Hats (12)
Party · Top Hat · Beanies · Bows · Cap · Crown · Santa · Witch · Flower Crown

### Accessories (10)
Round/Square/Heart Glasses · Scarves (incl. rainbow) · Bow Tie · Neck Tie · Necklace · Backpack

### Shoes (8)
Sneakers · Boots · Heels · Slippers · Sandals

---

## UI Components

### BearSVG (`components/BearSVG.jsx`)
Pure SVG renderer with 5 independent layers rendered in order:
1. **Shoes** (behind body)
2. **Body** (bear base with ears, eyes, blush)
3. **Clothes** (shirt/dress/overalls/hoodie/suit)
4. **Accessories** (glasses/scarf/tie/necklace/backpack)
5. **Hat** (on top)

All colors are dynamically computed including automatic darken/lighten for shading.

### BearContext (`context/BearContext.jsx`)
Global state via `useReducer`. Provides:
- `config` — current bear configuration
- `totalPrice` — computed from catalog prices
- `cart` — cart items array
- All setters and actions

### useVoiceRecorder (`hooks/useVoiceRecorder.js`)
Web Audio API hook:
- `startRecording()` — requests mic, starts MediaRecorder
- `stopRecording()` — stops and produces Blob
- `volume` — real-time audio level (0–1) for waveform animation
- `formattedDuration` — MM:SS timer

---

## Price System

Prices are computed by summing selected item prices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Framer Motion, react-colorful |
| Styling | Pure CSS with CSS Variables (no Tailwind needed) |
| State | React Context + useReducer |
| HTTP Client | Axios |
| Toast | react-hot-toast |
| Export | html2canvas |
| Backend | Node.js, Express 4 |
| Database | Microsoft SQL Server via `mssql` |
| File Upload | Multer |
| Validation | express-validator |
| Security | Helmet, CORS |

---

## Troubleshooting

### Database connection fails on startup
The server will start anyway without DB — customization works but save/load is disabled. Check:
- SQL Server service is running
- `.env` credentials are correct
- Firewall allows port 1433
- Try `DB_TRUST_CERT=true` and `DB_ENCRYPT=false` for local dev

### Microphone not working
- Browser must be on `localhost` or `https://` for mic access
- Check browser permissions (click lock icon in URL bar)
- Chrome/Firefox/Edge all supported; Safari has limited WebM support

### Frontend can't reach backend
- Verify backend is running on port 3001
- The `"proxy": "http://localhost:3001"` in frontend `package.json` handles this in dev
- For production, set `REACT_APP_API_URL` env variable

### html2canvas export is blank
- Make sure the bear SVG is fully rendered before capturing
- SVG must be inline (not `<img src=...>`) — this app renders inline correctly

---

## Production Deployment

```bash
# Build frontend
cd frontend && npm run build

# Serve the build folder via Express (add to server.js):
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

Set environment variables:
```env
NODE_ENV=production
DB_ENCRYPT=true
DB_TRUST_CERT=false
CLIENT_URL=https://yourdomain.com
```


# 🚀 Quick Start Guide

## ✅ Current Status

**Your app is LIVE and RUNNING!**

- 🌐 **URL:** http://localhost:5001
- 💾 **Database:** Connected to Neon PostgreSQL
- ✅ **Instagram Features:** Fully implemented
- ✅ **Facebook Features:** Already working

---

## 🎯 What You Can Do RIGHT NOW

### 1. Explore the App
Open http://localhost:5001 in your browser

**New Instagram Section in Sidebar:**
```
📍 Instagram
   ├── Instagram Publisher ← Click here first!
   └── Instagram Accounts
```

### 2. Download CSV Template
1. Go to Instagram Publisher tab
2. Click "Download Template"
3. Get `instagram-posts-template.xlsx`

### 3. See the Format
Template includes 10 example posts showing:
- Different media types (reel, video, photo)
- Various date formats
- Custom labels usage
- Multi-language support

---

## 📋 CSV Format (Copy-Paste Ready)

### Minimal Format:
```csv
caption,scheduledFor,mediaUrl,mediaType
"Post caption here #hashtags",2:30 PM,https://drive.google.com/file/d/ID/view,reel
```

### Complete Format:
```csv
caption,scheduledFor,mediaUrl,mediaType,customLabels,language
"Full example 🚀 #tag",10/15/2025 2:30 PM,https://url.com,reel,"label1, label2",en
```

### Date Formats Supported:
- `2:30 PM` (today)
- `10/15/2025 2:30 PM` (MM/DD/YYYY)
- `15/10/2025 14:30` (DD/MM/YYYY)
- `2025-10-15 14:30:00` (ISO - recommended)

**All times in IST (Indian Standard Time)**

---

## 🔑 When You Get Instagram API Credentials

### Step 1: Update .env

Edit: `/Users/zareb/Documents/Cursor AI/FacebookPublishMaster/.env`

Add:
```bash
INSTAGRAM_APP_ID=your_app_id_here
INSTAGRAM_APP_SECRET=your_app_secret_here
```

### Step 2: Restart Server

```bash
# In terminal, press Ctrl+C to stop server
# Then run:
cd "/Users/zareb/Documents/Cursor AI/FacebookPublishMaster"
export $(cat .env | grep -v '^#' | xargs)
npm run dev
```

### Step 3: Connect Instagram Account

API call to connect:
```bash
curl -X POST http://localhost:5001/api/instagram/accounts/connect \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "YOUR_FB_PAGE_ID",
    "pageAccessToken": "YOUR_PAGE_TOKEN"
  }'
```

### Step 4: Import Posts

1. Prepare CSV file
2. Go to http://localhost:5001/instagram
3. Click "Import Posts"
4. Select CSV file
5. Choose Instagram account
6. Import!

---

## ⚠️ Instagram API Limits

**Remember:**
- 25 posts per account per 24 hours
- For 1000 posts/day = need 40 accounts
- For 2000 posts/day = need 80 accounts

---

## 📂 Files You Need to Know

| File | Purpose |
|------|---------|
| `.env` | Add your API credentials here |
| `instagram-template.csv` | Example CSV to copy |
| `INSTAGRAM_CSV_FORMAT.md` | Complete CSV documentation |
| `INSTAGRAM_INTEGRATION_GUIDE.md` | Full setup guide |

---

## 🎵 Your Music Integration

**Current:** Upload videos with your music pre-mixed

**Future:** I can add automatic mixing:
```csv
caption,videoUrl,songName,mixRatio
"Dance reel",video.mp4,summer_vibes,0.8
```

System auto-mixes your copyrighted song before upload!

---

## ✨ Features Implemented

### Instagram Publisher Dashboard:
- ✅ Stats cards (scheduled, published, accounts, total)
- ✅ Rate limit tracker
- ✅ CSV import with preview
- ✅ Template download
- ✅ Recent posts display

### Instagram Accounts:
- ✅ List all connected accounts
- ✅ Daily post counter (X/25)
- ✅ Connection status
- ✅ Disconnect functionality

### Backend:
- ✅ Complete Instagram Graph API integration
- ✅ Scheduling system
- ✅ CSV parser and validator
- ✅ Rate limit enforcement
- ✅ Database operations

---

## 🧪 Test It Now!

Even without API credentials:

1. **Open:** http://localhost:5001
2. **Click:** Instagram (in sidebar)
3. **See:** Instagram Publisher dashboard
4. **Click:** Download Template
5. **Open:** Template in Excel
6. **Review:** Example format

**Everything works except actual publishing (needs API keys)**

---

## 📞 Need Help?

**Read the full guides:**
- `INSTAGRAM_CSV_FORMAT.md` - CSV format details
- `INSTAGRAM_INTEGRATION_GUIDE.md` - Complete setup

**Check your app:**
- http://localhost:5001 - Main app
- http://localhost:5001/instagram - Instagram tab
- http://localhost:5001/instagram-accounts - Accounts page

**Questions?** Just ask! 🎉


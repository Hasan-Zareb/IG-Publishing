# 📸 Instagram CSV Import Format Guide

## Overview
This document explains the exact format for importing Instagram posts via CSV/Excel files. This system supports bulk scheduling of photos, videos, and Reels to Instagram.

---

## 🎯 CSV Column Structure

### Required Columns

| Column Name | Required | Description | Example Values |
|------------|----------|-------------|----------------|
| **caption** | ✅ Yes | Post caption/description with hashtags | "Check out our new product! 🚀 #instagram #newlaunch" |
| **scheduledFor** | ✅ Yes | When to publish the post (IST timezone) | "2:30 PM", "10/15/2025 4:45 PM", "2025-10-16 18:30:00" |
| **mediaUrl** | ✅ Yes | Direct link to photo/video/reel file | "https://drive.google.com/file/d/ABC123/view" |
| **mediaType** | ✅ Yes | Type of media | "photo", "video", "reel" |

### Optional Columns

| Column Name | Required | Description | Example Values |
|------------|----------|-------------|----------------|
| **customLabels** | ❌ No | Comma-separated labels for tracking | "campaign1, product-launch, promo" |
| **language** | ❌ No | Language code | "en" (English), "hi" (Hindi), "ta" (Tamil) |

---

## 📅 Date/Time Formats Supported

The `scheduledFor` field accepts multiple formats (all in **IST - Indian Standard Time**):

### Format 1: Time Only (Uses Today's Date)
```
2:30 PM
10:45 AM
11:00 PM
```

### Format 2: MM/DD/YYYY with Time
```
10/15/2025 2:30 PM
7/24/2024 4:45 PM
12/31/2025 11:59 PM
```

### Format 3: DD/MM/YYYY with Time (International)
```
15/10/2025 14:30
28/07/2025 16:45
31/12/2025 23:59
```

### Format 4: ISO Format (YYYY-MM-DD HH:MM:SS)
```
2025-10-15 14:30:00
2025-07-28 16:45:30
2025-12-31 23:59:00
```

### Format 5: ISO Format Short (YYYY-MM-DD HH:MM)
```
2025-10-15 14:30
2025-07-28 16:45
2025-12-31 23:59
```

**⚠️ Important:** All times are automatically converted from IST to UTC for storage.

---

## 🎬 Media Types Explained

### 1. Reel (Recommended for Short Videos)
- **mediaType**: `reel`
- **Best for**: Vertical videos, 9:16 aspect ratio
- **Duration**: 15-90 seconds
- **Format**: MP4, MOV
- **Shows**: In Reels tab + Main feed
- **Example**:
  ```
  caption: "Quick tips for productivity 💡 #reels #tips"
  mediaType: reel
  mediaUrl: https://drive.google.com/file/d/ABC123/view
  ```

### 2. Video (Standard Video Post)
- **mediaType**: `video`
- **Best for**: Longer content, landscape or square
- **Duration**: Up to 60 minutes
- **Format**: MP4, MOV
- **Shows**: In Main feed only
- **Example**:
  ```
  caption: "Full tutorial on social media marketing 📈"
  mediaType: video
  mediaUrl: https://youtu.be/dQw4w9WgXcQ
  ```

### 3. Photo/Image
- **mediaType**: `photo` or `image`
- **Best for**: Static images, graphics, screenshots
- **Format**: JPG, PNG, GIF
- **Size**: Up to 8MB
- **Shows**: In Main feed
- **Example**:
  ```
  caption: "New product announcement! 🎉 #launch"
  mediaType: photo
  mediaUrl: https://i.imgur.com/example.jpg
  ```

---

## 🔗 Supported Media URL Formats

### Google Drive (Recommended)
```
https://drive.google.com/file/d/1ABC123XYZ/view?usp=sharing
https://drive.google.com/open?id=1ABC123XYZ
```

**Setup Requirements:**
1. Make file "Anyone with the link" can view
2. Use direct Google Drive link (not shortened)
3. Videos up to 400MB supported
4. Auto-downloads and processes before Instagram upload

### Dropbox
```
https://www.dropbox.com/s/abc123xyz/video.mp4?dl=0
```

**Requirements:**
1. Share link must be public
2. System auto-converts to direct download URL
3. Replace `dl=0` with `dl=1` for direct download

### YouTube (For Videos Only)
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
```

**Note:** Downloaded and re-uploaded to Instagram (not embedded)

### Direct URLs
```
https://example.com/image.jpg
https://cdn.example.com/video.mp4
```

**Requirements:**
1. Must be publicly accessible (no authentication)
2. Must use HTTPS
3. Direct file link (not a webpage)

---

## 🏷️ Custom Labels Format

Custom labels help you track campaign performance in Instagram Insights.

### Format
Comma-separated list of labels (no quotes needed):
```
campaign1, product-launch, summer-sale
```

### Rules
- Maximum 10 labels per post
- Each label: 1-25 characters
- No special characters except hyphens and underscores
- Case-insensitive

### Examples
```
✅ Good: "promo, sale, launch"
✅ Good: "campaign_1, test-group-a"
❌ Bad: "very-long-label-name-exceeding-character-limit"
❌ Bad: "label with spaces, another@label"
```

---

## 📋 Complete CSV Example

Here's a complete example CSV file:

```csv
caption,scheduledFor,mediaUrl,mediaType,customLabels,language
"New product launch! Get 20% off today 🎉 #sale #newproduct #shopping",2:30 PM,https://drive.google.com/file/d/1ABC123/view,reel,"sale, product-launch",en
"Behind the scenes of our photoshoot 📸 #bts #photography",10/15/2025 4:45 PM,https://drive.google.com/file/d/1XYZ789/view,video,"bts, content",en
"Customer testimonial - see what they're saying! ⭐",2025-10-16 18:30:00,https://drive.google.com/file/d/1DEF456/view,reel,"testimonial, reviews",en
"Weekend vibes ☀️ #weekend #relax",10/17/2025 10:00 AM,https://i.imgur.com/example.jpg,photo,"lifestyle",en
"Tutorial: How to use our app in Hindi 🇮🇳",15/10/2025 20:00,https://drive.google.com/file/d/1GHI789/view,reel,"tutorial, hindi-content",hi
```

### Column Details:

1. **caption**: Can include:
   - Emojis ✅
   - Hashtags (#trending)
   - Mentions (@username)
   - Line breaks (use `\n` in CSV)
   - Up to 2,200 characters

2. **scheduledFor**: 
   - All times in IST (Indian Standard Time)
   - Auto-converts to UTC for storage
   - Can be in the future only (past dates will fail)

3. **mediaUrl**:
   - Must be publicly accessible
   - HTTPS required
   - Supports Google Drive, Dropbox, YouTube, direct URLs

4. **mediaType**:
   - `reel`: Short vertical video (15-90 sec, 9:16 ratio)
   - `video`: Standard video post
   - `photo` or `image`: Static image
   
5. **customLabels**:
   - Comma-separated
   - Used for Instagram Insights analytics
   - Optional but recommended

6. **language**:
   - `en`: English
   - `hi`: Hindi  
   - `ta`: Tamil
   - `bn`: Bengali
   - etc.

---

## 🎨 Excel Template

Download the Excel template from the app:

**Steps:**
1. Go to Instagram Publisher tab
2. Click "Download Template"
3. The template includes:
   - Pre-formatted columns
   - Example data
   - Column descriptions
   - Data validation

---

## ⚙️ Import Process Flow

### Step 1: Prepare Your CSV
```
1. Create CSV with required columns
2. Add your caption, schedule times, and media URLs
3. Set mediaType for each post (reel/video/photo)
4. Optionally add customLabels for tracking
5. Save as .csv or .xlsx
```

### Step 2: Upload to System
```
1. Go to Instagram Publisher tab
2. Click "Import Posts"
3. Select your CSV/Excel file
4. Preview will show:
   - Total posts to import
   - Validation errors (if any)
   - Media type breakdown
```

### Step 3: Select Instagram Account
```
1. Choose which Instagram account to post from
2. Check daily limit (25 posts/24h per account)
3. System validates you're not exceeding limit
```

### Step 4: Import & Schedule
```
1. Click "Import Posts"
2. System processes each row:
   - Validates data
   - Downloads media if needed (Google Drive)
   - Creates scheduled post in database
   - Sets up auto-publish job
3. View progress in Recent Activity
```

---

## 🚨 Important Instagram API Limitations

### Rate Limits
- **25 posts per Instagram account per 24 hours** (API limit)
- **For 1000-2000 posts/day**: Need 40-80 Instagram Business accounts
- Daily limit resets 24 hours after first post

### Post Requirements
- **ALL Instagram posts require media** (no text-only posts)
- Photos: Max 8MB, JPG/PNG
- Videos: Max 100MB via URL, up to 1GB with resumable upload
- Reels: 15-90 seconds, vertical format recommended

### Account Requirements
- Must be Instagram Business or Creator account
- Must be connected to a Facebook Page
- Must have API permissions approved by Meta

---

## 📊 Advanced Features

### Multi-Account Distribution
For high-volume posting (1000-2000/day):

```csv
caption,scheduledFor,mediaUrl,mediaType,instagramAccount
"Post 1",2:00 PM,https://...,reel,account_1
"Post 2",2:05 PM,https://...,reel,account_2
"Post 3",2:10 PM,https://...,reel,account_3
```

System auto-distributes across accounts to respect 25/day limit.

### Audio Pre-Mixing (For Your Copyrighted Songs)
If you own the music copyright, use this workflow:

```csv
caption,scheduledFor,mediaUrl,mediaType,audioFile,audioVolume
"Dance video",2:00 PM,https://video.mp4,reel,song_summer_vibes.mp3,0.8
"Tutorial",3:00 PM,https://video2.mp4,video,background_music.mp3,0.5
```

System will mix your song with video using FFmpeg before upload.

---

## ✅ Validation Rules

The system validates each row before import:

### Caption Validation
- ✅ Required
- ✅ 1-2,200 characters
- ✅ Can include emojis, hashtags, mentions
- ❌ Cannot be empty

### ScheduledFor Validation
- ✅ Must be a valid date/time
- ✅ Must be in the future
- ✅ Accepts multiple formats (see above)
- ❌ Cannot be in the past
- ❌ Cannot be invalid date

### MediaUrl Validation
- ✅ Required (Instagram doesn't allow text-only posts)
- ✅ Must be valid URL
- ✅ Must be publicly accessible
- ✅ Must use HTTPS
- ❌ Cannot be empty
- ❌ Cannot be private/password-protected

### MediaType Validation
- ✅ Must be: photo, image, video, or reel
- ✅ Case-insensitive
- ❌ Invalid types will default to "reel" with warning

---

## 🔍 Example CSV Files

### Example 1: Simple Reel Schedule
```csv
caption,scheduledFor,mediaUrl,mediaType
"Morning motivation! 💪 #motivation #success",2:00 PM,https://drive.google.com/file/d/ABC/view,reel
"Quick recipe tutorial 🍳 #cooking #food",4:30 PM,https://drive.google.com/file/d/XYZ/view,reel
"Day in my life vlog 📸 #vlog #lifestyle",7:00 PM,https://drive.google.com/file/d/DEF/view,reel
```

### Example 2: Multi-Platform Content with Labels
```csv
caption,scheduledFor,mediaUrl,mediaType,customLabels,language
"Product launch in English 🚀 #launch",10/15/2025 2:30 PM,https://drive.google.com/file/d/ABC/view,reel,"launch, english-content, promo",en
"उत्पाद लॉन्च हिंदी में 🇮🇳 #launch",10/15/2025 3:30 PM,https://drive.google.com/file/d/XYZ/view,reel,"launch, hindi-content, promo",hi
"Weekend sale announcement 💰 #sale",10/16/2025 10:00 AM,https://i.imgur.com/sale.jpg,photo,"sale, weekend",en
```

### Example 3: High-Volume Schedule (1000 posts)
```csv
caption,scheduledFor,mediaUrl,mediaType,customLabels
"Post 1 content #day1",10/15/2025 12:00 AM,https://...,reel,"batch1"
"Post 2 content #day1",10/15/2025 12:15 AM,https://...,reel,"batch1"
"Post 3 content #day1",10/15/2025 12:30 AM,https://...,reel,"batch1"
...
"Post 1000 content #day42",10/26/2025 11:45 PM,https://...,reel,"batch42"
```

**Note:** With 40 accounts, you can schedule 1000 posts (25 per account)

---

## 🎵 Audio Mixing Feature (Coming Soon)

When you add audio mixing support for your copyrighted songs:

```csv
caption,scheduledFor,mediaUrl,mediaType,songFile,songVolume,videoVolume
"Dance reel",2:00 PM,video.mp4,reel,summer_vibes.mp3,0.8,0.2
"Tutorial",3:00 PM,tutorial.mp4,video,background_music.mp3,0.3,0.7
```

**Column Explanations:**
- **songFile**: Your copyrighted song filename (from your music library)
- **songVolume**: Song volume (0.0-1.0, where 0.8 = 80%)
- **videoVolume**: Original video audio volume (0.0-1.0)

---

## 📝 Creating Your CSV File

### Option 1: Microsoft Excel
1. Open Excel
2. Create headers in first row: `caption`, `scheduledFor`, `mediaUrl`, `mediaType`, `customLabels`, `language`
3. Fill in your data
4. Save As → CSV UTF-8 (Comma delimited) (*.csv)

### Option 2: Google Sheets
1. Create new sheet
2. Add headers
3. Fill data
4. File → Download → Comma Separated Values (.csv)

### Option 3: Download Template from App
1. Go to http://localhost:5001/instagram
2. Click "Download Template"
3. Opens in Excel with examples
4. Replace example data with yours
5. Save and import

---

## ⚠️ Common Errors & Solutions

### Error: "Caption is required"
**Problem:** Empty caption field  
**Solution:** Every post needs a caption (Instagram requirement)

### Error: "Media URL is required"
**Problem:** Missing mediaUrl  
**Solution:** Instagram doesn't allow text-only posts. Add image/video URL

### Error: "Invalid date format"
**Problem:** Unrecognized date format  
**Solution:** Use one of the supported formats above

### Error: "Scheduled time is in the past"
**Problem:** Date/time is before current time  
**Solution:** Use future dates only

### Error: "Daily limit reached (25/25)"
**Problem:** Account hit Instagram API limit  
**Solution:** 
- Wait 24 hours for reset
- Use different Instagram account
- Connect more accounts for higher capacity

### Error: "Media URL not accessible"
**Problem:** URL is private or requires login  
**Solution:**
- For Google Drive: Set sharing to "Anyone with the link"
- Use public URLs only
- Verify URL works in incognito browser

### Error: "Video too large"
**Problem:** Video exceeds Instagram limits  
**Solution:**
- Compress video before upload
- Use video under 100MB for standard upload
- For larger videos, system uses resumable upload

---

## 🎯 Pro Tips for Bulk Scheduling

### Tip 1: Stagger Your Posts
Instead of:
```
All at 2:00 PM (will all publish at once)
```

Do this:
```
2:00 PM, 2:15 PM, 2:30 PM, 2:45 PM...
(15-30 minute intervals)
```

### Tip 2: Distribute Across Accounts
For 1000 posts/day with 40 accounts:
```
Account 1: 25 posts (0:00 AM - 11:45 PM)
Account 2: 25 posts (0:00 AM - 11:45 PM)
...
Account 40: 25 posts (0:00 AM - 11:45 PM)
```

### Tip 3: Use Custom Labels for Campaigns
```csv
customLabels: "campaign-oct-2025, product-a, target-youth"
```

Then analyze in Instagram Insights to see which campaigns perform best.

### Tip 4: Language-Specific Content
```csv
language: en → English captions
language: hi → Hindi captions
language: ta → Tamil captions
```

Helps with Instagram's algorithmic distribution.

### Tip 5: Pre-Process Large Videos
For Google Drive videos over 100MB:
1. System auto-downloads
2. Uses FFmpeg to optimize
3. Uploads with chunked method
4. Preserves original quality

---

## 📊 CSV Import Limits

| Limit Type | Maximum | Notes |
|------------|---------|-------|
| File Size | 50 MB | For CSV/Excel file itself |
| Rows per Import | Unlimited | But respect daily account limits |
| Caption Length | 2,200 chars | Instagram API limit |
| Hashtags per Post | 30 | Instagram best practice |
| Media File Size | 100 MB standard<br>1 GB resumable | Automatic method selection |
| Posts per Account/Day | 25 | Instagram API hard limit |

---

## 🚀 Quick Start Example

**Minimal CSV for testing (3 Reels):**

```csv
caption,scheduledFor,mediaUrl,mediaType
"Test Reel 1 #test",2:00 PM,https://drive.google.com/file/d/FILEID1/view,reel
"Test Reel 2 #test",2:15 PM,https://drive.google.com/file/d/FILEID2/view,reel
"Test Reel 3 #test",2:30 PM,https://drive.google.com/file/d/FILEID3/view,reel
```

**Save as:** `instagram-test.csv`

**Import:**
1. Upload via Instagram Publisher
2. Select Instagram account
3. Import
4. Check Recent Activity for status

---

## 📞 Support & Troubleshooting

### Check Import Status
- **Recent Activity Tab**: Shows each imported post
- **Instagram Publisher Tab**: Shows statistics
- **Console Logs**: Check browser console (F12) for detailed errors

### Test Your Setup
1. Start with 1-3 test posts
2. Use short time intervals (2:00 PM, 2:05 PM, 2:10 PM)
3. Monitor the Recent Activity feed
4. Verify posts appear on Instagram
5. Then scale to bulk imports

### Getting Help
- Check browser console for detailed error messages
- Review validation errors in import response
- Verify Instagram account is properly connected
- Ensure API credentials are valid

---

## 📁 File Templates

You can download templates from:
- **In App**: Instagram Publisher → "Download Template" button
- **API Endpoint**: `GET /api/instagram/template`
- **Creates**: Excel file with examples and formatting

---

## 🎉 Success Checklist

Before importing your CSV, ensure:

- ✅ All required columns present (caption, scheduledFor, mediaUrl, mediaType)
- ✅ All media URLs are publicly accessible
- ✅ Dates are in the future
- ✅ Media type matches actual file type
- ✅ Caption length under 2,200 characters
- ✅ Instagram account connected
- ✅ Daily limit not exceeded
- ✅ API credentials configured in .env
- ✅ File is valid CSV or Excel format

---

**Happy Scheduling! 🚀**

For more help, visit the Settings page or check the system logs.


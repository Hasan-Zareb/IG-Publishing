# 🎯 Multi-Account Instagram CSV Import Guide

## 🎉 NEW FEATURE: Multi-Account Support in Single CSV!

You can now upload **1000+ posts across multiple Instagram accounts in ONE CSV file**!

---

## ✅ **What's New**

### **Before (Old Way):**
- ❌ One CSV = One Instagram account
- ❌ Need 40 separate CSV files for 1000 posts
- ❌ Manual import 40 times

### **After (New Way):**
- ✅ One CSV = Multiple Instagram accounts
- ✅ Single file for 1000 posts across 40 accounts
- ✅ One-click import!

---

## 📋 **New CSV Format**

### **Complete Format:**

```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername,customLabels,language
```

### **New Column: `accountUsername`**

Specify which Instagram account to use for each post!

**Examples:**
- `account1`
- `your_instagram_username`
- `@your_account` (@ symbol is optional)

**The system will:**
1. Match the username to your connected Instagram accounts
2. Schedule the post to that specific account
3. Track rate limits per account (25/day)
4. Auto-publish at scheduled time

---

## 🚀 **Quick Example (10 Posts Across 3 Accounts)**

```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername,customLabels,language
"Post for Account 1 - Morning 💪 #motivation",2:00 PM,https://drive.google.com/file/d/F1/view,reel,account1,"motivation",en
"Post for Account 2 - Recipe 🍳 #cooking",2:00 PM,https://drive.google.com/file/d/F2/view,reel,account2,"cooking",en
"Post for Account 3 - Fashion 👗 #style",2:00 PM,https://drive.google.com/file/d/F3/view,reel,account3,"fashion",en
"Post for Account 1 - Workout 🏋️ #fitness",2:15 PM,https://drive.google.com/file/d/F4/view,reel,account1,"fitness",en
"Post for Account 2 - Dessert 🍰 #baking",2:15 PM,https://drive.google.com/file/d/F5/view,reel,account2,"baking",en
"Post for Account 3 - OOTD 📸 #outfit",2:15 PM,https://drive.google.com/file/d/F6/view,reel,account3,"outfit",en
"Post for Account 1 - Tips 📈 #productivity",2:30 PM,https://drive.google.com/file/d/F7/view,reel,account1,"tips",en
"Post for Account 2 - Lunch 🥗 #healthy",2:30 PM,https://drive.google.com/file/d/F8/view,reel,account2,"healthy",en
"Post for Account 3 - Shopping 🛍️ #haul",2:30 PM,https://drive.google.com/file/d/F9/view,reel,account3,"shopping",en
"Post for Account 1 - Evening 🌅 #sunset",2:45 PM,https://drive.google.com/file/d/F10/view,reel,account1,"lifestyle",en
```

**Result:**
- Account 1: Gets 4 posts (rows 1, 4, 7, 10)
- Account 2: Gets 3 posts (rows 2, 5, 8)
- Account 3: Gets 3 posts (rows 3, 6, 9)
- All scheduled at same times
- All posts from ONE CSV upload!

---

## 📊 **For 1000 Posts Across 40 Accounts**

### **CSV Structure:**

```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername
"Account 1 - Post 1",10/15/2025 12:00 AM,https://...,reel,account1
"Account 2 - Post 1",10/15/2025 12:00 AM,https://...,reel,account2
"Account 3 - Post 1",10/15/2025 12:00 AM,https://...,reel,account3
... (37 more accounts)
"Account 40 - Post 1",10/15/2025 12:00 AM,https://...,reel,account40
"Account 1 - Post 2",10/15/2025 12:15 AM,https://...,reel,account1
"Account 2 - Post 2",10/15/2025 12:15 AM,https://...,reel,account2
... (continue pattern)
"Account 40 - Post 25",10/15/2025 11:45 PM,https://...,reel,account40
```

**Result:**
- 1000 posts total
- 25 posts per account (respects limit)
- Distributed across 40 accounts
- Single CSV import!

---

## 🎯 **Two Ways to Import**

### **Method 1: Multi-Account CSV (Recommended for Bulk)**

**CSV with accountUsername column:**
```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername
"Post 1",2:00 PM,https://...,reel,account1
"Post 2",2:05 PM,https://...,reel,account2
"Post 3",2:10 PM,https://...,reel,account1
```

**Import Process:**
1. Upload CSV
2. Select "🎯 Multi-Account" in dropdown (default)
3. Click Import
4. System reads accountUsername from each row
5. Schedules to correct account automatically

**Benefits:**
- ✅ 1000 posts in one file
- ✅ Smart distribution
- ✅ One upload
- ✅ Automatic account matching

### **Method 2: Single Account Override**

**CSV without accountUsername:**
```csv
caption,scheduledFor,mediaUrl,mediaType
"Post 1",2:00 PM,https://...,reel
"Post 2",2:15 PM,https://...,reel
"Post 3",2:30 PM,https://...,reel
```

**Import Process:**
1. Upload CSV
2. Select specific account: "@your_account"
3. Click Import
4. All posts go to selected account

**Benefits:**
- ✅ Simple for small batches
- ✅ Quick single-account uploads
- ✅ No need to add accountUsername column

**Limit:** Max 25 posts (Instagram API limit per account)

---

## 📝 **Account Username Matching**

### **How System Matches Accounts:**

**Your Connected Accounts:**
```
@mycompany_official
@mycompany_deals
@mycompany_tutorials
```

**CSV accountUsername Values That Work:**

| CSV Value | Matches Account | Notes |
|-----------|-----------------|-------|
| `mycompany_official` | @mycompany_official | ✅ Exact match |
| `@mycompany_official` | @mycompany_official | ✅ @ symbol removed automatically |
| `MyCompany_Official` | @mycompany_official | ✅ Case-insensitive |
| `official` | @mycompany_official | ✅ Partial match |
| `deals` | @mycompany_deals | ✅ Partial match |
| `tutorials` | @mycompany_tutorials | ✅ Partial match |

**Values That DON'T Work:**

| CSV Value | Result | Solution |
|-----------|--------|----------|
| `account99` | ❌ Not found | Connect this account first |
| `nonexistent` | ❌ Not found | Check spelling or connect account |
| `` (empty) | ❌ No account specified | Add accountUsername or select in UI |

---

## 🎬 **Complete Workflow Example**

### **Scenario: Schedule 1000 Reels Across 40 Accounts**

#### **Step 1: Connect 40 Instagram Accounts**

First, connect all your Instagram Business accounts:
- @yourcompany_1
- @yourcompany_2
- @yourcompany_3
- ...
- @yourcompany_40

#### **Step 2: Create Master CSV**

Create `master-1000-reels.csv`:

```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername,customLabels
"Reel 1 for Account 1",10/15/2025 12:00 AM,https://drive.google.com/file/d/F1/view,reel,yourcompany_1,"batch-1"
"Reel 2 for Account 2",10/15/2025 12:00 AM,https://drive.google.com/file/d/F2/view,reel,yourcompany_2,"batch-1"
"Reel 3 for Account 3",10/15/2025 12:00 AM,https://drive.google.com/file/d/F3/view,reel,yourcompany_3,"batch-1"
... (37 more for accounts 4-40)
"Reel 41 for Account 1 (2nd post)",10/15/2025 12:15 AM,https://drive.google.com/file/d/F41/view,reel,yourcompany_1,"batch-1"
"Reel 42 for Account 2 (2nd post)",10/15/2025 12:15 AM,https://drive.google.com/file/d/F42/view,reel,yourcompany_2,"batch-1"
... (continue pattern)
"Reel 1000 for Account 40 (25th post)",10/15/2025 11:45 PM,https://drive.google.com/file/d/F1000/view,reel,yourcompany_40,"batch-40"
```

**Distribution:**
- Account 1: Posts 1, 41, 81, 121, ... (25 posts total)
- Account 2: Posts 2, 42, 82, 122, ... (25 posts total)
- Account 3: Posts 3, 43, 83, 123, ... (25 posts total)
- ...
- Account 40: Posts 40, 80, 120, ... (25 posts total)

#### **Step 3: Import (One Click!)**

1. Go to http://localhost:5001/instagram
2. Click "Import Posts"
3. Upload `master-1000-reels.csv`
4. Leave as "🎯 Multi-Account" (default)
5. Click "Import"

**Processing time:** ~30 seconds

#### **Step 4: Confirmation**

```
✅ Import Successful!
Imported 1000 posts across 40 accounts
0 failed

Distribution:
- @yourcompany_1: 25 posts
- @yourcompany_2: 25 posts
- @yourcompany_3: 25 posts
... (37 more)
- @yourcompany_40: 25 posts

All posts scheduled for Oct 15, 2025
```

#### **Step 5: Automatic Publishing**

**October 15, 2025 - 12:00 AM (Midnight):**
```
🚀 40 posts publish simultaneously
   - 1 from each account
   ✅ All 40 live on Instagram!
```

**12:15 AM:**
```
🚀 Another 40 posts publish
   ✅ Accounts now at 2/25 each
```

**Continues every 15 minutes...**

**11:45 PM:**
```
🚀 Final batch of 40 posts publish
   ✅ All accounts now at 25/25
   ✅ Total: 1000 posts published in 24 hours!
```

**All automatic - zero manual work!**

---

## 🎨 **UI Workflow**

### **Import Dialog:**

```
┌──────────────────────────────────────────────┐
│  Upload Instagram Posts                      │
├──────────────────────────────────────────────┤
│                                              │
│  File Selected: master-1000-reels.csv        │
│                                              │
│  Select Instagram Account (Optional)         │
│  [🎯 Multi-Account (Use accountUsername)] ▼ │
│  - OR -                                      │
│  [@account1 (12/25 posts today)]            │
│  [@account2 (8/25 posts today)]             │
│  [@account3 (0/25 posts today)]             │
│                                              │
│  💡 Multi-Account Import Info:               │
│  Option 1: Add "accountUsername" column      │
│  Option 2: Select one account above          │
│                                              │
│  [Cancel]  [Import Posts]                    │
└──────────────────────────────────────────────┘
```

---

## 🔍 **Behind the Scenes**

### **Import Processing:**

```javascript
For each row in CSV:
    ↓
    Read accountUsername column
    ↓
    if (accountUsername exists in CSV) {
        ↓
        Find matching Instagram account
        accountMap.get(accountUsername.toLowerCase())
        ↓
        if (found) {
            ✅ Use that account
        } else {
            ❌ Error: "Account 'xyz' not found"
        }
    } else {
        ↓
        Use account selected in UI dropdown
    }
    ↓
    Check daily limit for selected account
    ↓
    if (< 25 posts today) {
        ✅ Schedule post
    } else {
        ⚠️ Warning: "May fail - limit reached"
        (Still schedules, but will fail when publishing)
    }
    ↓
    Create post in database
    ↓
    Schedule publish job
```

---

## ⚖️ **Smart Distribution Strategies**

### **Strategy 1: Round Robin (Balanced)**

Distribute posts evenly across accounts:

```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername
"Post 1",12:00 AM,url1,reel,account1
"Post 2",12:00 AM,url2,reel,account2
"Post 3",12:00 AM,url3,reel,account3
... (to account40)
"Post 41",12:15 AM,url41,reel,account1  ← Back to account 1
"Post 42",12:15 AM,url42,reel,account2
... (continue pattern)
```

**Result:** Each account gets exactly 25 posts

### **Strategy 2: Time-Based (Staggered)**

Same time, different accounts:

```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername
"Post 1",2:00 PM,url1,reel,account1
"Post 2",2:00 PM,url2,reel,account2
"Post 3",2:00 PM,url3,reel,account3
... (all at 2:00 PM, different accounts)
```

**Result:** 40 posts publish simultaneously at 2:00 PM

### **Strategy 3: Account-Specific Content**

Different content types per account:

```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername
"Motivational content",2:00 PM,url1,reel,motivation_account
"Cooking content",2:00 PM,url2,reel,cooking_account
"Fashion content",2:00 PM,url3,reel,fashion_account
```

**Result:** Niche content to niche accounts

---

## 📊 **Rate Limit Management**

### **Automatic Tracking:**

System tracks per account:

```
Account 1: 12/25 posts today (48% used)
Account 2: 25/25 posts today (100% used - FULL)
Account 3: 5/25 posts today (20% used)
```

### **When Importing:**

```
Row 1: account1 → ✅ OK (12/25)
Row 2: account2 → ⚠️ WARNING (25/25 - may fail)
Row 3: account3 → ✅ OK (5/25)
```

**If account is full:**
- Still imports to database
- Schedules the post
- But will fail when trying to publish
- Error logged: "Daily limit reached"

**Solution:**
- Wait 24 hours for reset
- Or reassign to different account

---

## 🎯 **Real-World Example: 2000 Posts/Day**

### **Setup:**

**80 Instagram Accounts:**
```
@brand_reels_1
@brand_reels_2
...
@brand_reels_80
```

### **CSV File:**

Create `daily-2000-posts.csv` with pattern:

```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername
"Post 1",12:00 AM,url1,reel,brand_reels_1
"Post 2",12:00 AM,url2,reel,brand_reels_2
... (to brand_reels_80)
"Post 81",12:02 AM,url81,reel,brand_reels_1
... (25 rounds of 80 accounts = 2000 posts)
```

**Time to create CSV:** Use Excel formula to generate!

**Excel Formula for accountUsername:**
```excel
=CONCATENATE("brand_reels_", MOD(ROW()-2, 80) + 1)
```

This auto-generates: brand_reels_1, brand_reels_2, ..., brand_reels_80, then repeats!

### **Import:**

1. Upload `daily-2000-posts.csv`
2. Select "Multi-Account"
3. Click Import
4. Wait ~1 minute

**Result:**
```
✅ Imported 2000 posts
Distributed across 80 accounts
25 posts per account (exactly at limit)
All scheduled for Oct 15, 2025
```

### **Publishing:**

**Throughout the day:**
- Every 2 minutes: 80 posts publish (1 from each account)
- By midnight: All 2000 posts published
- Zero manual work

---

## 🔧 **Account Username Format**

### **Accepted Formats:**

```csv
accountUsername values:
- account1          ← Simple name
- @account1         ← With @ symbol
- Account1          ← Case insensitive
- my_account_1      ← Underscores OK
- my-account-1      ← Hyphens OK
```

### **System Matching Logic:**

```javascript
1. Remove @ symbol if present
2. Convert to lowercase
3. Try exact match first
4. If not found, try partial match
5. If still not found, return error
```

**Example:**
```
CSV: "MyCompany_Reels"
    ↓
Normalized: "mycompany_reels"
    ↓
Matches: @MyCompany_Reels
    ↓
✅ Post scheduled to @MyCompany_Reels
```

---

## ⚠️ **Important Notes**

### **1. Connect Accounts First**

Before importing, ensure accounts are connected:
```bash
curl -X GET http://localhost:5001/api/instagram/accounts
```

Should return all your accounts. If empty, connect them first!

### **2. Account Names Must Match**

CSV accountUsername **must match** connected account username:

```
Connected: @my_instagram_account
CSV: my_instagram_account ✅
CSV: my_instagram ✅ (partial match)
CSV: instagram_account ✅ (partial match)
CSV: random_name ❌ (no match)
```

### **3. Rate Limit Warnings**

System warns but doesn't block:
```
Row 27: account1 has 25/25 posts today
⚠️ WARNING: May fail when publishing
✅ Imported anyway (will try to publish)
```

### **4. Validation Errors**

If account not found:
```
Row 50: Instagram account "unknown_account" not found
❌ FAILED: Skipped this row
```

**Fix:** Connect the account or fix username in CSV

---

## 📋 **Column Priority**

### **Account Selection Logic:**

```
1. Check if accountUsername column exists in CSV
    ↓
    YES → Use accountUsername from each row
    NO → Use account selected in UI dropdown
```

**Examples:**

**CSV has accountUsername:**
```csv
caption,...,accountUsername
"Post 1",...,account1  ← Uses account1
"Post 2",...,account2  ← Uses account2
```

**CSV has accountUsername but UI has account selected:**
```csv
caption,...,accountUsername
"Post 1",...,account1  ← Uses account1 (CSV overrides UI)
```

**CSV doesn't have accountUsername:**
```csv
caption,scheduledFor,mediaUrl,mediaType
"Post 1",2:00 PM,url,reel
```

**UI selection:** @account3  
**Result:** All posts go to @account3

---

## 🎉 **Benefits of Multi-Account**

### **For Small Batches (10-25 Posts):**
- Use single account
- Quick and simple
- No need for accountUsername column

### **For Medium Batches (26-100 Posts):**
- Use 2-4 accounts
- Add accountUsername column
- Distribute for parallel publishing

### **For Large Batches (1000-2000 Posts):**
- Use 40-80 accounts
- accountUsername column required
- Single CSV = entire day scheduled
- Automated distribution
- Maximizes throughput

---

## 📝 **Template Examples**

### **Download New Template:**

1. Go to http://localhost:5001/instagram
2. Click "Download Template"
3. New template now includes accountUsername column!

**Template shows:**
- 5 example posts
- Using 3 different accounts (account1, account2, account3)
- Different media types (reel, video, photo)
- Multi-language (English, Hindi)
- Custom labels
- Various date formats

### **Ready-to-Use Template:**

Located at: `/Users/zareb/Documents/Cursor AI/FacebookPublishMaster/instagram-template.csv`

**Just:**
1. Open in Excel
2. Replace account1/account2/account3 with your actual usernames
3. Replace media URLs with yours
4. Replace captions
5. Set your schedule times
6. Upload!

---

## 🚀 **Testing Multi-Account**

### **Test with 6 Posts Across 2 Accounts:**

**test-multi-account.csv:**
```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername
"Account 1 - Test 1",2:00 PM,https://...,reel,account1
"Account 2 - Test 1",2:00 PM,https://...,reel,account2
"Account 1 - Test 2",2:05 PM,https://...,reel,account1
"Account 2 - Test 2",2:05 PM,https://...,reel,account2
"Account 1 - Test 3",2:10 PM,https://...,reel,account1
"Account 2 - Test 3",2:10 PM,https://...,reel,account2
```

**Expected Result:**
- Account 1: 3 posts (at 2:00, 2:05, 2:10 PM)
- Account 2: 3 posts (at 2:00, 2:05, 2:10 PM)
- Both publish in parallel

---

## ✅ **Summary**

### **New Format (Multi-Account):**
```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername,customLabels,language
```

### **Key Benefits:**
- ✅ 1000+ posts in ONE CSV
- ✅ Multiple accounts in ONE file
- ✅ Smart account matching
- ✅ Automatic distribution
- ✅ Rate limit tracking per account
- ✅ Single upload for entire batch

### **Backwards Compatible:**
- ✅ Old format still works (without accountUsername)
- ✅ UI account selection still works
- ✅ No breaking changes

### **Perfect For:**
- ✅ High-volume posting (1000-2000/day)
- ✅ Multi-account management
- ✅ Automated scheduling
- ✅ Bulk campaigns

---

**Feature is LIVE now! Try it at http://localhost:5001/instagram** 🎉


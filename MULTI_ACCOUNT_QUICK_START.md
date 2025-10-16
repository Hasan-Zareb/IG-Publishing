# 🚀 Multi-Account Instagram - Quick Start

## ✅ **IMPLEMENTED: Multiple Accounts in One CSV!**

---

## 📋 **New CSV Format**

```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername,customLabels,language
```

### **Key Addition: `accountUsername` Column**

This column lets you specify which Instagram account to use for each post!

---

## 🎯 **Two Import Methods**

### **Method 1: Multi-Account CSV** ⭐ NEW!

**CSV with accountUsername:**
```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername
"Post from Account 1",2:00 PM,https://...,reel,account1
"Post from Account 2",2:05 PM,https://...,reel,account2
"Post from Account 3",2:10 PM,https://...,reel,account3
"Post from Account 1 again",2:15 PM,https://...,reel,account1
```

**Import:**
1. Upload CSV
2. Select "🎯 Multi-Account" (default)
3. Import
4. Done!

**Result:** Posts distributed to specified accounts automatically

### **Method 2: Single Account (Old Way)**

**CSV without accountUsername:**
```csv
caption,scheduledFor,mediaUrl,mediaType
"Post 1",2:00 PM,https://...,reel
"Post 2",2:15 PM,https://...,reel
"Post 3",2:30 PM,https://...,reel
```

**Import:**
1. Upload CSV
2. Select specific account: "@your_account"
3. Import

**Result:** All posts go to selected account (max 25)

---

## 🎬 **Example: 1000 Posts Across 40 Accounts**

### **CSV Structure:**

```csv
caption,scheduledFor,mediaUrl,mediaType,accountUsername
"Post 1 - Account 1",10/15/2025 12:00 AM,https://drive.google.com/file/d/F1/view,reel,brand_1
"Post 2 - Account 2",10/15/2025 12:00 AM,https://drive.google.com/file/d/F2/view,reel,brand_2
"Post 3 - Account 3",10/15/2025 12:00 AM,https://drive.google.com/file/d/F3/view,reel,brand_3
... (to brand_40)
"Post 41 - Account 1",10/15/2025 12:15 AM,https://drive.google.com/file/d/F41/view,reel,brand_1
... (repeat pattern 25 times)
"Post 1000 - Account 40",10/15/2025 11:45 PM,https://drive.google.com/file/d/F1000/view,reel,brand_40
```

**Excel Formula to Auto-Generate accountUsername:**
```excel
Cell F2: =CONCATENATE("brand_", MOD(ROW()-2, 40) + 1)
```
Drag down 1000 rows!

---

## ✅ **Quick Reference**

### **Required Columns:**
- caption ✅
- scheduledFor ✅  
- mediaUrl ✅
- mediaType ✅

### **Optional Columns:**
- accountUsername ⭐ NEW (for multi-account)
- customLabels
- language

### **Account Username Rules:**
- Can include or exclude @ symbol
- Case-insensitive
- Must match connected account
- Partial matches work (e.g., "official" matches "@mycompany_official")

### **Import Options:**
- 🎯 Multi-Account: Uses accountUsername from CSV
- 👤 Specific Account: All posts to one account

---

## 🎉 **Benefits**

✅ **1000 posts in ONE file** (vs 40 files before)  
✅ **One upload** (vs 40 uploads before)  
✅ **Smart distribution** (automatic account matching)  
✅ **Rate limit aware** (tracks per account)  
✅ **Backwards compatible** (old format still works)  
✅ **Time saver** (2 minutes vs 30 minutes for 1000 posts)

---

## 📱 **Access Now**

**Your app:** http://localhost:5001/instagram

**Download new template:**
- Click "Download Template"
- See accountUsername column in action
- Replace with your data
- Upload!

---

## 🎯 **Next Steps**

1. **Download template:** See new format
2. **Connect accounts:** Add all 40-80 Instagram accounts
3. **Create CSV:** 1000 posts with accountUsername column
4. **Upload:** One click import
5. **Relax:** System handles everything!

**Feature is LIVE and ready to use! 🚀**


# 🚀 מדריך העלאה לשרת

## שלב 1: יצירת חשבון GitHub

1. הירשם ב: https://github.com
2. צור Repository חדש (פרטי מומלץ)
3. שם מומלץ: `business-forecast-app`

---

## שלב 2: יצירת מסד נתונים ב-Neon (חינם)

1. **הירשם** ב: https://neon.tech
2. **צור פרויקט חדש**:
   - Project name: `business-forecast`
   - Region: `Europe (Frankfurt)` (הכי קרוב לישראל)
3. **העתק את ה-Connection Strings**:
   - לחץ על "Connection Details"
   - העתק את `DATABASE_URL` (עם `?sslmode=require`)
   - העתק את `DIRECT_URL` (אותו דבר)

---

## שלב 3: העלאה ל-GitHub

פתח Terminal בתיקיית הפרויקט והרץ:

```bash
# אתחול Git
git init

# הוספת כל הקבצים
git add .

# Commit ראשון
git commit -m "Initial commit - business forecast app"

# חיבור ל-GitHub (החלף YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/business-forecast-app.git

# העלאה
git branch -M main
git push -u origin main
```

---

## שלב 4: פריסה ב-Vercel

1. **הירשם** ב: https://vercel.com (עם חשבון GitHub)

2. **צור פרויקט חדש**:
   - לחץ "Add New Project"
   - בחר את ה-Repository שיצרת
   - לחץ "Import"

3. **הגדר Environment Variables** (חשוב!):
   
   לחץ על "Environment Variables" והוסף:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | (העתק מ-Neon) |
   | `DIRECT_URL` | (העתק מ-Neon) |
   | `NEXTAUTH_SECRET` | (מחרוזת אקראית ארוכה - לפחות 32 תווים) |
   | `NEXTAUTH_URL` | `https://YOUR-APP.vercel.app` |

4. **לחץ "Deploy"** - ההעלאה תיקח 2-3 דקות

---

## שלב 5: יצירת טבלאות במסד הנתונים

לאחר שהפריסה הצליחה, צריך ליצור את הטבלאות.

### אפשרות א': דרך Vercel CLI

```bash
# התקנת Vercel CLI
npm i -g vercel

# התחברות
vercel login

# קישור לפרויקט
vercel link

# הרצת Prisma
vercel env pull .env.local
npx prisma db push
```

### אפשרות ב': דרך Neon Console

1. היכנס ל-Neon Dashboard
2. לחץ על "SQL Editor"
3. העתק והדבק את ה-SQL מהקובץ שיווצר:

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > init.sql
```

---

## שלב 6: יצירת משתמש מנהל

לאחר יצירת הטבלאות, צור משתמש מנהל:

1. היכנס ל-Neon SQL Editor
2. הרץ:

```sql
INSERT INTO "User" (
  id, username, password, "businessName", role,
  "securityQuestion1", "securityAnswer1",
  "securityQuestion2", "securityAnswer2",
  "isEmailVerified", "createdAt", "updatedAt"
) VALUES (
  'admin-id-123',
  'efiraz',
  '$2a$12$YOUR_HASHED_PASSWORD', -- צריך ליצור hash
  'מנהל מערכת',
  'admin',
  'שאלה 1',
  'תשובה',
  'שאלה 2', 
  'תשובה',
  false,
  NOW(),
  NOW()
);
```

**או** השתמש ב-Vercel CLI להרצת הסקריפט:
```bash
npx tsx prisma/seed-admin.ts
```

---

## ✅ סיום!

האפליקציה שלך אמורה לעבוד בכתובת:
```
https://YOUR-APP.vercel.app
```

---

## 🔧 פתרון בעיות

### שגיאת "NEXTAUTH_URL"
וודא שהכתובת ב-Vercel מתאימה בדיוק לכתובת האתר

### שגיאת Database
וודא שה-Connection String מ-Neon נכון וכולל `?sslmode=require`

### שגיאת Build
בדוק את הלוגים ב-Vercel Dashboard

---

## 📞 תמיכה

אם יש בעיות, בדוק:
1. Vercel Logs: `https://vercel.com/YOUR_PROJECT/deployments`
2. Neon Dashboard: `https://console.neon.tech`

# מערכת חיזוי כלכלי לעסקים

מערכת פולסטאק לניהול וחיזוי כלכלי לעסקים קטנים, מיועדת ליועצים כלכליים.

## תכונות עיקריות

- **תחזית 12 חודשים** - חיזוי הכנסות, הוצאות, רווח/הפסד ותזרים מזומנים
- **רמזור מצב עסק** - אינדיקציה ויזואלית (ירוק/צהוב/אדום) למצב בריאות העסק
- **ניתוח תרחישים** - "מה יקרה אם..." - שינוי פרמטרים וצפייה בהשפעה
- **השוואה להיסטוריה** - השוואת תחזית לביצועים בפועל
- **ניהול מימון** - הלוואות והשקעות עם חישוב פחת אוטומטי

## טכנולוגיות

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite + Prisma ORM
- **Auth**: NextAuth.js
- **UI**: TailwindCSS, Recharts

## התקנה והפעלה

### דרישות מקדימות

- Node.js 18+
- npm

### שלבי התקנה

1. **התקנת dependencies**:
```bash
npm install
```

2. **הגדרת מסד נתונים**:
```bash
npx prisma generate
npx prisma db push
```

3. **יצירת נתוני דוגמה**:
```bash
npm run db:seed
```

4. **הרצת השרת**:
```bash
npm run dev
```

5. **פתיחה בדפדפן**:
   - כתובת: http://localhost:3000
   - משתמש דמו: `demo@example.com` / `demo123`

## מבנה הפרויקט

```
├── prisma/
│   ├── schema.prisma      # סכמת מסד נתונים
│   └── seed.ts            # נתוני דוגמה
├── src/
│   ├── app/
│   │   ├── (auth)/        # דפי התחברות והרשמה
│   │   ├── businesses/    # דפי עסקים
│   │   └── api/           # API endpoints
│   ├── components/
│   │   ├── ui/            # קומפוננטים בסיסיים
│   │   ├── charts/        # גרפים
│   │   ├── dashboard/     # קומפוננטי דשבורד
│   │   └── layout/        # layout components
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   ├── forecast.ts    # לוגיקת חיזוי
│   │   ├── prisma.ts      # Prisma client
│   │   └── utils.ts       # פונקציות עזר
│   └── types/
│       └── index.ts       # TypeScript types
```

## API Endpoints

| Endpoint | Method | תיאור |
|----------|--------|-------|
| `/api/auth/[...nextauth]` | * | התחברות/התנתקות |
| `/api/auth/register` | POST | הרשמה |
| `/api/businesses` | GET, POST | רשימת/יצירת עסקים |
| `/api/businesses/[id]` | GET, PUT, DELETE | עסק בודד |
| `/api/businesses/[id]/drivers` | GET, POST | דרייברים חודשיים |
| `/api/businesses/[id]/loans` | GET, POST | הלוואות |
| `/api/businesses/[id]/investments` | GET, POST | השקעות |
| `/api/businesses/[id]/history` | GET, POST | היסטוריית ביצועים |
| `/api/forecast` | GET | תחזית 12 חודשים |
| `/api/forecast/what-if` | POST | תרחישי מה-אם |

## לוגיקת החיזוי

המערכת מחשבת תחזית על בסיס:

1. **הכנסות**: `מספר לקוחות × הכנסה ממוצעת ללקוח`
2. **הוצאות**: שיווק + כ"א + הנהלה + עמלות אשראי + הלוואות + פחת
3. **רווח/הפסד**: הכנסות - הוצאות
4. **תזרים מזומנים**: הכנסות - (הוצאות + תשלומי הלוואות)
5. **יתרת בנק**: יתרה קודמת + תזרים

### קביעת רמזור

- **ירוק**: רווחיות מעל 5% ותזרים חיובי
- **צהוב**: רווחיות נמוכה או תנודות בתזרים
- **אדום**: הפסדים משמעותיים או תזרים שלילי מתמשך

## פיתוח עתידי

- [ ] ייצוא דוחות ל-PDF/Excel
- [ ] התראות אוטומטיות
- [ ] אינטגרציה עם מערכות הנהלת חשבונות
- [ ] תמיכה במטבעות נוספים

## רישיון

MIT

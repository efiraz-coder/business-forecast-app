# מערכת חיזוי כלכלי לעסקים קטנים - מסמך אפיון

## תיאור כללי

מערכת ווב מלאה (Full-Stack) לניהול וחיזוי כלכלי לעסקים קטנים, מיועדת ליועצים כלכליים. המערכת מאפשרת:
- הזנת נתונים עסקיים ידנית
- חיזוי אוטומטי ל-12 חודשים קדימה **על בסיס מודל ROI שיווקי**
- ניתוח תרחישים "מה יקרה אם..."
- הצגת מצב בריאות העסק ברמזור (ירוק/צהוב/אדום)
- חישוב **"יתרה לחיסכון"** (מודל המיזם של בן)

## מודל ROI שיווקי - "המיזם של בן"

המערכת מיישמת מודל פיננסי מבוסס החזר השקעה שיווקית:

```
הכנסה לפי ערוץ = תקציב_שיווק × יחס_החזר_שיווקי (ROI)
עלות משתנה (כ"א) = הכנסה × אחוז_עלות_משתנה (למשל 37%)
רווח גולמי = הכנסה - עלות_משתנה
רווח תפעולי = רווח_גולמי - שיווק - הוצאות_קבועות - תפעול
רווח נקי = רווח_תפעולי - הוצאות_מימון
יתרה לחיסכון = רווח_נקי + הכנסות_נוספות - הוצאות_מחיה
```

## טכנולוגיות

| רכיב | טכנולוגיה |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| שפה | TypeScript |
| מסד נתונים | SQLite + Prisma ORM |
| אימות | NextAuth.js (Credentials) |
| עיצוב | TailwindCSS |
| גרפים | Recharts |
| ממשק | עברית (RTL) |

## מבנה מסד הנתונים

### טבלאות עיקריות:

1. **Advisor** - יועצים (משתמשי המערכת)
   - id, name, email, password

2. **Business** - עסקים
   - id, name, ownerName, createdAt

3. **AdvisorBusiness** - קישור יועץ-עסק (many-to-many)

4. **RevenueChannel** - ערוצי מכירה
   - id, businessId, name, isActive

5. **ExpenseGroup** - קבוצות הוצאה (מערכתיות)
   - שיווק, כ"א, הנהלה וכלליות, הוצאות ישירות, מימון, בנק ועמלות

6. **ExpenseItem** - פריטי הוצאה ספציפיים
   - id, businessId, expenseGroupId, name, monthlyAmount

7. **Driver** - דרייברים חודשיים (בסיס התחזית)
   - year, month, expectedCustomers, avgRevenuePerCustomer
   - marketingBudget, headcount, payrollTotal, adminExpenses, creditCardFeeRate

8. **Loan** - הלוואות
   - principal, interestRate, startDate, endDate

9. **Investment** - השקעות הוניות
   - name, amount, date, depreciationPeriodMonths

10. **HistoricalActual** - היסטוריית ביצוע
    - year, month, revenueAmountTotal, profitLossTotal, cashFlowTotal

## סכמת Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Advisor {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  businesses AdvisorBusiness[]
}

model Business {
  id        String   @id @default(cuid())
  name      String
  ownerName String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  advisors         AdvisorBusiness[]
  revenueChannels  RevenueChannel[]
  expenseItems     ExpenseItem[]
  drivers          Driver[]
  loans            Loan[]
  investments      Investment[]
  historicalActuals HistoricalActual[]
}

model AdvisorBusiness {
  id         String   @id @default(cuid())
  advisorId  String
  businessId String
  role       String   @default("owner")
  createdAt  DateTime @default(now())
  advisor  Advisor  @relation(fields: [advisorId], references: [id], onDelete: Cascade)
  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  @@unique([advisorId, businessId])
}

model RevenueChannel {
  id         String   @id @default(cuid())
  businessId String
  name       String
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
}

model ExpenseGroup {
  id        String   @id @default(cuid())
  name      String   @unique
  type      String   @default("fixed")
  createdAt DateTime @default(now())
  expenseItems ExpenseItem[]
}

model ExpenseItem {
  id             String   @id @default(cuid())
  businessId     String
  expenseGroupId String
  name           String
  monthlyAmount  Float    @default(0)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  business     Business     @relation(fields: [businessId], references: [id], onDelete: Cascade)
  expenseGroup ExpenseGroup @relation(fields: [expenseGroupId], references: [id])
}

model Driver {
  id                     String   @id @default(cuid())
  businessId             String
  year                   Int
  month                  Int
  expectedCustomers      Int      @default(0)
  avgRevenuePerCustomer  Float    @default(0)
  marketingBudget        Float    @default(0)
  headcount              Int      @default(0)
  payrollTotal           Float    @default(0)
  adminExpenses          Float    @default(0)
  creditCardFeeRate      Float    @default(0)
  notes                  String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  @@unique([businessId, year, month])
}

model Loan {
  id               String   @id @default(cuid())
  businessId       String
  name             String   @default("הלוואה")
  principal        Float
  interestRate     Float
  startDate        DateTime
  endDate          DateTime
  paymentFrequency String   @default("monthly")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
}

model Investment {
  id                       String   @id @default(cuid())
  businessId               String
  name                     String
  amount                   Float
  date                     DateTime
  depreciationPeriodMonths Int      @default(0)
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt
  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
}

model HistoricalActual {
  id                 String   @id @default(cuid())
  businessId         String
  year               Int
  month              Int
  revenueAmountTotal Float    @default(0)
  profitLossTotal    Float    @default(0)
  cashFlowTotal      Float?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  @@unique([businessId, year, month])
}
```

## לוגיקת החיזוי

הפונקציה `getForecastForBusiness()` מחשבת:

```
הכנסות = מספר_לקוחות × הכנסה_ממוצעת_ללקוח

הוצאות = שיווק + כ"א + הנהלה + עמלות_אשראי + הלוואות + פחת

רווח/הפסד = הכנסות - הוצאות

תזרים = הכנסות - (הוצאות + תשלומי_הלוואות)

יתרת_בנק[t] = יתרת_בנק[t-1] + תזרים[t]
```

### קביעת רמזור:
- **ירוק**: רווחיות > 5% ותזרים חיובי
- **צהוב**: רווחיות נמוכה או תנודות בתזרים
- **אדום**: הפסדים משמעותיים או תזרים שלילי מתמשך

### פלט התחזית (ForecastResult):

```typescript
interface ForecastResult {
  year: number;
  month: number;
  monthName: string;
  totalRevenueForecast: number;
  totalExpensesForecast: number;
  profitLossForecast: number;
  cashFlowForecast: number;
  bankBalanceForecast: number;
  actualRevenue?: number;
  actualProfitLoss?: number;
  revenueDeltaPercent?: number;
  profitDeltaPercent?: number;
  trafficLight: 'green' | 'yellow' | 'red';
  trafficLightReason: string;
}
```

## מסכי המערכת

| נתיב | תיאור |
|------|-------|
| `/` | דף הבית - הסבר על המערכת |
| `/login` | התחברות |
| `/register` | הרשמה |
| `/businesses` | רשימת העסקים של היועץ |
| `/businesses/[id]/dashboard` | דשבורד - גרפים, רמזור, טבלת תחזית |
| `/businesses/[id]/drivers` | הגדרת דרייברים חודשיים |
| `/businesses/[id]/financing` | ניהול הלוואות והשקעות |
| `/businesses/[id]/history` | הזנת נתונים היסטוריים |
| `/businesses/[id]/what-if` | ניתוח תרחישים |
| `/businesses/[id]/settings` | הגדרות עסק, ערוצי מכירה, פריטי הוצאה |

## API Endpoints

| Endpoint | Methods | תיאור |
|----------|---------|-------|
| `/api/auth/[...nextauth]` | * | אימות |
| `/api/auth/register` | POST | הרשמה |
| `/api/businesses` | GET, POST | עסקים |
| `/api/businesses/[id]` | GET, PUT, DELETE | עסק בודד |
| `/api/businesses/[id]/drivers` | GET, POST | דרייברים |
| `/api/businesses/[id]/loans` | GET, POST | הלוואות |
| `/api/businesses/[id]/investments` | GET, POST | השקעות |
| `/api/businesses/[id]/history` | GET, POST | היסטוריה |
| `/api/businesses/[id]/revenue-channels` | GET, POST | ערוצי מכירה |
| `/api/businesses/[id]/expense-items` | GET, POST | פריטי הוצאה |
| `/api/expense-groups` | GET | קבוצות הוצאה |
| `/api/forecast` | GET | תחזית 12 חודשים |
| `/api/forecast/what-if` | POST | תרחיש מה-אם |

## תכונות עיקריות

### 1. דשבורד
- רמזור מצב עסק עם הסבר
- 4 כרטיסי סיכום (הכנסות, רווח, תזרים, יתרה)
- גרף רווח/הפסד חודשי
- גרף יתרת בנק
- טבלת תחזית מפורטת

### 2. ניתוח תרחישים (What-If)
- סליידרים לשינוי פרמטרים:
  - שינוי במספר לקוחות (%)
  - שינוי בהכנסה ממוצעת (%)
  - שינוי בתקציב שיווק (%)
  - שינוי במספר עובדים (+/-)
- השוואה ויזואלית בין תחזית בסיסית לתרחיש

### 3. ניהול נתונים
- הוספה/עריכה של דרייברים לכל חודש
- ניהול הלוואות עם חישוב החזר אוטומטי
- ניהול השקעות עם חישוב פחת
- הזנת נתונים היסטוריים להשוואה

## מבנה תיקיות

```
business-forecast-app/
├── prisma/
│   ├── schema.prisma          # סכמת מסד נתונים
│   ├── seed.ts                # נתוני דוגמה
│   └── dev.db                 # קובץ מסד הנתונים
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── businesses/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── layout.tsx
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── drivers/page.tsx
│   │   │       ├── financing/page.tsx
│   │   │       ├── history/page.tsx
│   │   │       ├── what-if/page.tsx
│   │   │       └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── businesses/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── drivers/route.ts
│   │   │   │       ├── loans/route.ts
│   │   │   │       ├── investments/route.ts
│   │   │   │       ├── history/route.ts
│   │   │   │       ├── revenue-channels/route.ts
│   │   │   │       └── expense-items/route.ts
│   │   │   ├── expense-groups/route.ts
│   │   │   └── forecast/
│   │   │       ├── route.ts
│   │   │       └── what-if/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Slider.tsx
│   │   │   └── index.ts
│   │   ├── charts/
│   │   │   ├── ForecastChart.tsx
│   │   │   └── ForecastTable.tsx
│   │   ├── dashboard/
│   │   │   ├── TrafficLight.tsx
│   │   │   └── StatCard.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── BusinessLayout.tsx
│   │   └── Providers.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── forecast.ts
│   │   ├── prisma.ts
│   │   └── utils.ts
│   └── types/
│       ├── index.ts
│       └── next-auth.d.ts
├── .env
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── README.md
└── SPEC.md
```

## הרצת המערכת

```bash
# התקנה
npm install

# הגדרת מסד נתונים
npx prisma generate
npx prisma db push

# נתוני דוגמה
npx tsx prisma/seed.ts

# הרצה
npm run dev
```

## פרטי התחברות (דמו)

- **אימייל**: `demo@example.com`
- **סיסמה**: `demo123`

## פיתוח עתידי (אפשרויות להרחבה)

- [ ] ייצוא דוחות ל-PDF/Excel
- [ ] התראות אוטומטיות על סטיות מהתחזית
- [ ] אינטגרציה עם מערכות הנהלת חשבונות
- [ ] תמיכה במטבעות נוספים
- [ ] דוחות השוואה בין תקופות
- [ ] ניהול מספר יועצים לעסק
- [ ] יומן פעילות (audit log)

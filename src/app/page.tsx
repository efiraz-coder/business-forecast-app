'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  BarChart3, 
  TrendingUp, 
  Sliders, 
  FileText,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-gray-900">
            תכנון כלכלי מבוסס דרייברים
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            מערכת חכמה לחיזוי פיננסי לעסקים קטנים.
            הזן את הנתונים שלך וקבל תחזית מדויקת ל-12 חודשים קדימה.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/wizard/step-1">
              <Button size="lg">
                התחל עכשיו
                <ArrowLeft className="h-5 w-5 mr-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                צפה בדמו
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <FeatureCard
            icon={FileText}
            title="שאלון מובנה"
            description="10 מסכים פשוטים שמנחים אותך להזנת כל הנתונים הנדרשים - מפרטי העסק ועד הוצאות מימון"
          />
          <FeatureCard
            icon={TrendingUp}
            title="תחזית אוטומטית"
            description="המערכת מחשבת אוטומטית הכנסות, הוצאות, רווח/הפסד, תזרים ויתרת בנק ל-12 חודשים"
          />
          <FeatureCard
            icon={Sliders}
            title="ניתוח תרחישים"
            description="מה יקרה אם? שנה פרמטרים כמו כמות לקוחות, מחיר או תקציב שיווק וראה את ההשפעה מיד"
          />
        </div>

        {/* Process */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">איך זה עובד?</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <ProcessStep 
              number={1} 
              title="פרטי עסק" 
              description="שם, תחום ויתרת פתיחה"
            />
            <ProcessStep 
              number={2} 
              title="מוצרים וכ״א" 
              description="הגדר מוצרים, שירותים ועובדים"
            />
            <ProcessStep 
              number={3} 
              title="תחזיות" 
              description="מכירות, שיווק והוצאות צפויות"
            />
            <ProcessStep 
              number={4} 
              title="דשבורד" 
              description="צפה בתחזית ובגרפים"
            />
          </div>
        </div>

        {/* Layers Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                <h3 className="font-bold">שכבה 1: ליבה</h3>
              </div>
              <p className="text-sm text-gray-600">
                פרטי עסק, מוצרים, כ״א והוצאות קבועות. מספיק לתחזית בסיסית.
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                <h3 className="font-bold">שכבה 2: תחזית</h3>
              </div>
              <p className="text-sm text-gray-600">
                תחזית מכירות, שינויים בכ״א ותקציב שיווק. לתחזית מדויקת יותר.
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
                <h3 className="font-bold">שכבה 3: מתקדם</h3>
              </div>
              <p className="text-sm text-gray-600">
                פירוט הוצאות חודשי, הלוואות ועמלות. אופציונלי לדיוק מקסימלי.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">
          <p>מערכת תכנון כלכלי לעסקים קטנים</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <Card className="text-center">
      <CardContent className="pt-6">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </CardContent>
    </Card>
  )
}

function ProcessStep({ 
  number, 
  title, 
  description 
}: { 
  number: number
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
        {number}
      </div>
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}

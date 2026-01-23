# Telecom Repair Intake & Tracking

واجهة عربية بسيطة لفواتير صيانة أجهزة الاتصالات مع إدخال سريع وتحديث الحالة بعد الحفظ.

## المتطلبات
- Node.js 18+
- SQLite (محلياً)

## التشغيل محلياً
1) انسخ إعدادات البيئة إلى ملف `.env`:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me"
ADMIN_EMAIL="admin@local.test"
ADMIN_PASSWORD="Admin12345"
ADMIN_NAME="Admin"
SHOP_NAME="محل الصيانة"
SHOP_PHONE="+966500000000"
```
2) تثبيت الاعتمادات وتشغيل الهجرات:
```
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```
3) تشغيل التطبيق:
```
npm run dev
```

## بيانات الدخول الافتراضية
- البريد: `ADMIN_EMAIL`
- كلمة المرور: `ADMIN_PASSWORD`

## النسخ الاحتياطي لقاعدة البيانات
```
cp dev.db backup.db
```

## التدفق الأساسي
- الصفحة الرئيسية هي “إضافة فاتورة” مع 4 حقول أساسية.
- يمكن حفظ الفاتورة بحد أدنى أي حقلين أو (اسم العميل + نوع الجهاز) أو (الجوال + المشكلة).
- التعديل وإدارة الحالة من صفحة “لوحة التحكم”.

## ملاحظات
- جميع التواريخ تُخزن بصيغة ISO (Gregorian).
- واجهة RTL افتراضية للغة العربية.
- إرسال واتساب يتم عبر رابط `wa.me` مع نص مُولد ديناميكياً.
- للإنتاج يمكن التحويل إلى PostgreSQL بتغيير `DATABASE_URL` وموفر `provider` في Prisma.

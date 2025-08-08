# 🧺 ระบบจัดการร้านซักรีดอัตโนมัติ (Smart Laundromat System)

ระบบจัดการร้านซักรีดแบบ Self-Service ที่ลูกค้าสามารถตรวจสอบสถานะเครื่องซักผ้า หยอดเหรียญ และรับการแจ้งเตือนแบบ real-time

## ✨ Features

### 🪙 ระบบหยอดเหรียญจำลอง
- เลือกเหรียญ 1, 5, 10 บาท
- คำนวณเงินทอนอัตโนมัติ  
- ตรวจสอบจำนวนเงินเพียงพอ
- UI สวยงามแบบ Modal

### 🎛️ การแสดงสถานะเครื่อง
- **🟢 ว่าง** - พร้อมใช้งาน (สีเขียว)
- **⏰ กำลังทำงาน** - ไม่ว่าง + countdown timer (สีแดง)
- **🔧 ปิดปรับปรุง** - ซ่อมบำรุง (สีเทา)
- **⚠️ เหลือเวลาน้อย** - กระพริบสีเหลืองเมื่อเหลือ < 60 วินาที

### 🔔 ระบบแจ้งเตือนครบครัน
- **Toast Notifications** - ข้อความแจ้งเตือนมุมขวาบน
- **Browser Notifications** - การแจ้งเตือนระบบ (ต้องให้ permission)
- **เสียงแจ้งเตือน** - Web Audio API
- **แจ้งเตือนอัตโนมัติ** - เมื่อเหลือ 60 วินาที และเมื่อเสร็จสิ้น

### ⏰ Real-time Updates
- อัพเดทสถานะทุกวินาที
- Auto refresh ข้อมูลทุก 10 วินาที
- Timer countdown แม่นยำ
- อัพเดทสถานะอัตโนมัติเมื่อเสร็จสิ้น

## 🛠 Tech Stack

### Frontend
- **Next.js 15.4.6** - App Router
- **React 19** - Latest features
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Modern styling

### Backend & Database
- **Next.js API Routes** - Serverless functions
- **Supabase** - PostgreSQL database
- **Prisma** - Type-safe ORM
- **RESTful APIs** - Clean architecture

### Development Tools
- **Turbopack** - Fast development builds
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 📦 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd wash-station
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
สร้างไฟล์ `.env.local`:
```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
```

### 4. Database Setup
```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed initial data
npx tsx scripts/seed.ts
```

### 5. Development
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## 🗄 Database Schema

```prisma
model Machine {
  id          Int       @id @default(autoincrement())
  name        String    // "เครื่องที่ 1", "เครื่องที่ 2"
  status      Status    @default(AVAILABLE)
  startTime   DateTime?
  endTime     DateTime?
  duration    Int       @default(30) // นาที
  price       Decimal   @default(20.00) // บาท
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@map("machines")
}

enum Status {
  AVAILABLE   // ว่าง
  RUNNING     // กำลังซัก  
  MAINTENANCE // ปิดปรับปรุง
}
```

## 📱 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/machines` | ดึงสถานะเครื่องทั้งหมด |
| `POST` | `/api/machines` | สร้างเครื่องเริ่มต้น |
| `POST` | `/api/machines/[id]/start` | เริ่มใช้เครื่องซักผ้า |
| `PUT` | `/api/machines/[id]/status` | อัพเดทสถานะเครื่อง |
| `POST` | `/api/notifications/browser` | ส่งการแจ้งเตือน |

## 🏗 Project Structure

```
wash-station/
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes
│   │   │   ├── machines/          # Machine CRUD
│   │   │   └── notifications/     # Notification APIs
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Home page
│   ├── components/
│   │   ├── CoinInsertModal.tsx    # หยอดเหรียญ Modal
│   │   ├── MachineCard.tsx        # การ์ดแสดงเครื่อง
│   │   ├── MachineGrid.tsx        # Grid layout เครื่อง
│   │   └── NotificationToast.tsx  # Toast notifications
│   ├── lib/
│   │   ├── notification-utils.ts  # Notification manager
│   │   ├── prisma.ts              # Prisma client
│   │   ├── supabase.ts            # Supabase client
│   │   └── utils.ts               # Utilities
│   └── types/
│       └── index.ts               # TypeScript types
├── prisma/
│   └── schema.prisma              # Database schema
├── scripts/
│   ├── seed.ts                    # Database seeding
│   └── update-duration.ts         # Utility scripts
└── public/                        # Static files
```

## 🎮 Usage Guide

### สำหรับลูกค้า
1. **ดูสถานะเครื่อง** - เครื่องว่าง (เขียว) พร้อมใช้งาน
2. **เลือกเครื่อง** - แตะการ์ดเครื่องว่าง
3. **หยอดเหรียญ** - เลือกเหรียญในหน้า Modal
4. **รอการทำงาน** - ดู countdown timer
5. **รับการแจ้งเตือน** - เมื่อเหลือ 1 นาที และเมื่อเสร็จ

### การแจ้งเตือน
- 🔔 **60 วินาทีก่อนเสร็จ** - "กรุณาเตรียมมารับผ้า"
- ✅ **เมื่อเสร็จสิ้น** - "ซักเสร็จแล้ว กรุณามารับผ้า"
- 🎵 **เสียงแจ้งเตือน** - ทั้งคู่จะมีเสียงประกอบ

## 🧪 Testing

### สำหรับ Development
- เครื่องตั้งเวลา **2 นาที** เพื่อทดสอบ
- เปลี่ยนได้ด้วย script: `npx tsx scripts/update-duration.ts`

### Test Scenarios
1. **เครื่องว่าง → หยอดเหรียญ → เริ่มซัก**
2. **หลายเครื่องทำงานพร้อมกัน**  
3. **การแจ้งเตือนเมื่อเหลือ 1 นาที**
4. **การรีเซ็ตสถานะเมื่อเสร็จสิ้น**
5. **Browser notifications permission**

## 🚀 Production Deployment

### Vercel (แนะนำ)
```bash
# Build และ deploy
npm run build
```

### Environment Variables
ตั้งค่า environment variables เหมือนกับ `.env.local`

### Database Migration
```bash
npx prisma migrate deploy
```

## 🔧 Scripts

| Script | คำสั่ง | คำอธิบาย |
|--------|--------|----------|
| Development | `npm run dev` | รัน dev server |
| Build | `npm run build` | Build สำหรับ production |
| Start | `npm run start` | รัน production build |
| Lint | `npm run lint` | ตรวจสอบ code quality |
| Database Seed | `npx tsx scripts/seed.ts` | สร้างข้อมูลเริ่มต้น |
| Update Duration | `npx tsx scripts/update-duration.ts` | เปลี่ยนเวลาซัก |

## 🎨 UI/UX Features

### Responsive Design
- 📱 Mobile-first approach
- 💻 Desktop optimized
- 🎯 Touch-friendly interface

### Visual Feedback
- 🎨 สีสันชัดเจนแยกสถานะ
- ✨ Animation และ transitions
- 💫 Loading states
- 🔥 Hover effects

### Accessibility
- 🎯 Semantic HTML
- ⌨️ Keyboard navigation
- 🔊 Screen reader friendly
- 🎪 High contrast colors

## 🔮 Future Enhancements

### Phase 2 - Supabase Realtime
- 📡 Multi-device sync
- 👥 Admin dashboard
- 📊 Usage analytics
- 🔄 Real-time collaboration

### Phase 3 - Advanced Features
- 📝 Queue system (จองล่วงหน้า)
- 💳 Payment integration
- 📱 Mobile app
- 🏪 Multi-branch support


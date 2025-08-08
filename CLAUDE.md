# ระบบจัดการร้านซักรีดอัตโนมัติ (Smart Laundromat System)

## 📋 Project Overview
ระบบจัดการร้านซักรีดแบบ Self-Service ที่ลูกค้าสามารถตรวจสอบสถานะเครื่องซักผ้า หยอดเหรียญ และรับการแจ้งเตือนผ่าน Line

## 🎯 Core Requirements
1. **ระบบหยอดเหรียญ**: ลูกค้าสามารถหยอดเหรียญเพื่อใช้เครื่องซักผ้า
2. **ตรวจสอบสถานะ**: แสดงเครื่องซักผ้าที่ว่างและไม่ว่าง
3. **แจ้งเตือนบนหน้าจอ**: แสดงการแจ้งเตือนบนหน้าจอเมื่อเหลือเวลาน้อยกว่า 1 นาที

## 🛠 Technology Stack
- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **Real-time**: Supabase Realtime
- **Notifications**: Browser Notifications API + Toast Messages
- **Payment**: เหรียญ/เงินสด (จำลองด้วย UI)

## 📁 Project Structure
```
laundromat-system/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # หน้าหลัก Customer Interface
│   │   ├── api/
│   │   │   ├── machines/
│   │   │   │   ├── route.ts         # CRUD เครื่องซักผ้า
│   │   │   │   └── [id]/
│   │   │   │       ├── start/route.ts    # เริ่มใช้เครื่อง
│   │   │   │       └── status/route.ts   # อัพเดทสถานะ
│   │   │   └── notifications/
│   │   │       └── browser/route.ts  # Browser notifications
│   │   └── globals.css
│   ├── components/
│   │   ├── MachineCard.tsx          # แสดงสถานะเครื่องแต่ละเครื่อง
│   │   ├── MachineGrid.tsx          # Grid แสดงเครื่องทั้งหมด
│   │   ├── CoinInsertModal.tsx      # Modal หยอดเหรียญ
│   │   ├── NotificationToast.tsx    # Toast notification component
│   │   └── TimerDisplay.tsx         # แสดงเวลาถอยหลัง
│   ├── lib/
│   │   ├── prisma.ts                # Prisma client
│   │   ├── supabase.ts              # Supabase client
│   │   ├── notification-utils.ts    # Browser notification functions
│   │   └── utils.ts                 # Utility functions
│   └── types/
│       └── index.ts                 # TypeScript definitions
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── migrations/
└── .env.local                       # Environment variables
```

## 🗄 Database Schema (Prisma)

### Machines Table
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

## 🎨 UI Components Requirements

### หน้าหลัก (Customer Interface)
- **Header**: ชื่อร้าน + เวลาปัจจุบัน
- **Machine Grid**: แสดงเครื่องซักผ้าทั้งหมดในรูป Grid 2x2
- **Machine Card**: 
  - สีเขียว = ว่าง
  - สีแดง = ไม่ว่าง + แสดงเวลาถอยหลัง
  - สีเทา = ปิดปรับปรุง

### Machine Card Component
```typescript
interface MachineCardProps {
  machine: {
    id: number
    name: string
    status: 'AVAILABLE' | 'RUNNING' | 'MAINTENANCE'
    endTime?: Date
    price: number
  }
  onStartMachine: (machineId: number) => void
}
```

## 🔄 Core Features Implementation

### 1. ระบบหยอดเหรียญ
- Modal popup สำหรับเลือกจำนวนเหรียญ
- จำลองการหยอดเหรียญด้วย UI (เหรียญ 1, 5, 10 บาท)
- ตรวจสอบจำนวนเงินเพียงพอ
- เริ่มการทำงานเครื่องซักผ้า

### 2. Real-time Status Updates
- ใช้ Supabase Realtime สำหรับอัพเดทสถานะแบบ real-time
- Timer countdown แบบ client-side
- Auto refresh เมื่อเครื่องเสร็จสิ้นการทำงาน

### 3. Notification System
- Browser Notifications (ขอ permission จาก user)
- Toast messages บนหน้าจอ
- เสียงแจ้งเตือน
- เปลี่ยนสี Machine Card เป็นสีเหลืองกระพริบเมื่อเหลือ < 1 นาที
- Format ข้อความ: "🧺 เครื่องที่ X เหลือเวลา XX วินาที กรุณาเตรียมมารับผ้า"

## 📱 API Endpoints

### GET /api/machines
- ดึงสถานะเครื่องซักผ้าทั้งหมด

### POST /api/machines/[id]/start
- เริ่มใช้เครื่องซักผ้า
- Body: `{ amount: number }`
- Response: อัพเดทสถานะเป็น RUNNING

### PUT /api/machines/[id]/status
- อัพเดทสถานะเครื่อง (สำหรับ background jobs)

### POST /api/notifications/browser
- ส่งแจ้งเตือนบนหน้าจอ
- Body: `{ message: string, machineId: number, type: 'warning' | 'success' }`

## ⏰ Background Jobs / Client-side Timers

### Notification Management
- ใช้ setInterval สำหรับจัดการ timer
- ตรวจสอบเวลาทุก 10 วินาที  
- แสดง Browser notification เมื่อเหลือ 1 นาที
- เล่นเสียงแจ้งเตือน + Toast message
- เปลี่ยนสี Machine Card เป็นกระพริบ
- อัพเดทสถานะเป็น AVAILABLE เมื่อหมดเวลา

## 🔧 Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

## 🚀 Development Guidelines

### Code Style
- ใช้ TypeScript strict mode
- ใช้ Tailwind CSS สำหรับ styling
- Components แบบ functional + hooks
- Error handling ทุก API call
- Loading states สำหรับ UX ที่ดี

### Key Features to Implement First
1. ✅ Database setup (Prisma + Supabase)
2. ✅ Machine status display
3. ✅ Coin insertion simulation
4. ✅ Timer countdown
5. ✅ Browser notifications + Toast messages

### Testing Scenarios
- เครื่องว่าง → หยอดเหรียญ → เริ่มซัก
- หลายเครื่องทำงานพร้อมกัน
- การแจ้งเตือนเมื่อเหลือ 1 นาที (Browser + Toast + Sound)
- การรีเซ็ตสถานะเมื่อเสร็จสิ้น

## 📝 Additional Notes
- ระบบนี้เป็น Self-Service ไม่ต้องมี Authentication
- UI ควรเรียบง่าย เข้าใจง่ายสำหรับลูกค้าทุกกลุ่มอายุ
- ใช้สีสันและไอคอนชัดเจนเพื่อแสดงสถานะ
- Responsive design สำหรับหน้าจอขนาดต่างๆ
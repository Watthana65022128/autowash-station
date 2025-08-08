import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ลบข้อมูลเก่าก่อน (ถ้ามี)
  await prisma.machine.deleteMany()

  // สร้างเครื่องซักผ้า 4 เครื่อง
  const machines = await prisma.machine.createMany({
    data: [
      {
        name: 'เครื่องที่ 1',
        status: 'AVAILABLE',
        duration: 30,
        price: 20
      },
      {
        name: 'เครื่องที่ 2',
        status: 'AVAILABLE',
        duration: 30,
        price: 20
      },
      {
        name: 'เครื่องที่ 3',
        status: 'AVAILABLE',
        duration: 30,
        price: 20
      },
      {
        name: 'เครื่องที่ 4',
        status: 'AVAILABLE',
        duration: 30,
        price: 20
      }
    ]
  })

  console.log(`✅ Created ${machines.count} machines`)
  
  const allMachines = await prisma.machine.findMany()
  console.log('📋 All machines:', allMachines)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
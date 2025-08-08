import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateDuration() {
  console.log('🔧 Updating machine duration to 2 minutes...')
  
  const result = await prisma.machine.updateMany({
    data: {
      duration: 2
    }
  })
  
  console.log(`✅ Updated ${result.count} machines`)
  
  const machines = await prisma.machine.findMany()
  machines.forEach(m => console.log(`${m.name}: ${m.duration} minutes`))
  
  await prisma.$disconnect()
}

updateDuration().catch(console.error)
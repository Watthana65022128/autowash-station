import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: { id: 'asc' }
    })
    
    return NextResponse.json(machines)
  } catch (error) {
    console.error('Error fetching machines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch machines' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    // สร้างเครื่องซักผ้า 4 เครื่อง
    const machines = await Promise.all([
      prisma.machine.create({
        data: {
          name: 'เครื่องที่ 1',
          status: 'AVAILABLE',
          duration: 30,
          price: 20
        }
      }),
      prisma.machine.create({
        data: {
          name: 'เครื่องที่ 2', 
          status: 'AVAILABLE',
          duration: 30,
          price: 20
        }
      }),
      prisma.machine.create({
        data: {
          name: 'เครื่องที่ 3',
          status: 'AVAILABLE', 
          duration: 30,
          price: 20
        }
      }),
      prisma.machine.create({
        data: {
          name: 'เครื่องที่ 4',
          status: 'AVAILABLE',
          duration: 30, 
          price: 20
        }
      })
    ])
    
    return NextResponse.json(machines)
  } catch (error) {
    console.error('Error creating machines:', error)
    return NextResponse.json(
      { error: 'Failed to create machines' },
      { status: 500 }
    )
  }
}
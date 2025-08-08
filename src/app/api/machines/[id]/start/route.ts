import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const machineId = parseInt(id)
    const { amount } = await request.json()
    
    // ตรวจสอบเครื่องซักผ้า
    const machine = await prisma.machine.findUnique({
      where: { id: machineId }
    })
    
    if (!machine) {
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      )
    }
    
    if (machine.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Machine is not available' },
        { status: 400 }
      )
    }
    
    // ตรวจสอบจำนวนเงิน
    if (amount < machine.price) {
      return NextResponse.json(
        { error: 'Insufficient amount' },
        { status: 400 }
      )
    }
    
    // เริ่มใช้เครื่อง
    const now = new Date()
    const endTime = new Date(now.getTime() + machine.duration * 60 * 1000)
    
    const updatedMachine = await prisma.machine.update({
      where: { id: machineId },
      data: {
        status: 'RUNNING',
        startTime: now,
        endTime: endTime
      }
    })
    
    return NextResponse.json({
      machine: updatedMachine,
      change: amount - Number(machine.price)
    })
    
  } catch (error) {
    console.error('Error starting machine:', error)
    return NextResponse.json(
      { error: 'Failed to start machine' },
      { status: 500 }
    )
  }
}
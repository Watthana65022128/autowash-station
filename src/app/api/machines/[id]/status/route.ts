import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const machineId = parseInt(params.id)
    const { status } = await request.json()
    
    const updatedMachine = await prisma.machine.update({
      where: { id: machineId },
      data: {
        status: status,
        ...(status === 'AVAILABLE' && {
          startTime: null,
          endTime: null
        })
      }
    })
    
    return NextResponse.json(updatedMachine)
    
  } catch (error) {
    console.error('Error updating machine status:', error)
    return NextResponse.json(
      { error: 'Failed to update machine status' },
      { status: 500 }
    )
  }
}
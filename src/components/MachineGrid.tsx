'use client'

import { Machine } from '@/types'
import MachineCard from './MachineCard'

interface MachineGridProps {
  machines: Machine[]
  onStartMachine: (machineId: number) => void
}

export default function MachineGrid({ machines, onStartMachine }: MachineGridProps) {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {machines.map((machine) => (
          <MachineCard 
            key={machine.id} 
            machine={machine} 
            onStartMachine={onStartMachine}
          />
        ))}
      </div>
      
      {machines.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-xl text-gray-600">กำลังโหลดข้อมูลเครื่องซักผ้า...</p>
        </div>
      )}
    </div>
  )
}
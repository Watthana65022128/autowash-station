'use client'

import { Machine } from '@/types'
import { useState, useEffect } from 'react'

interface MachineCardProps {
  machine: Machine
  onStartMachine: (machineId: number) => void
}

export default function MachineCard({ machine, onStartMachine }: MachineCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    if (machine.status === 'RUNNING' && machine.endTime) {
      const timer = setInterval(() => {
        const now = new Date()
        const end = new Date(machine.endTime!)
        const remaining = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
        
        setTimeRemaining(remaining)
        
        // เริ่มกระพริบเมื่อเหลือน้อยกว่า 60 วินาที
        setIsBlinking(remaining < 60 && remaining > 0)
        
        if (remaining === 0) {
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [machine.status, machine.endTime])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getCardColor = () => {
    if (machine.status === 'MAINTENANCE') return 'bg-gray-400'
    if (machine.status === 'RUNNING') {
      if (isBlinking) return 'bg-yellow-400 animate-pulse'
      return 'bg-red-500'
    }
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (machine.status === 'MAINTENANCE') return 'ปิดปรับปรุง'
    if (machine.status === 'RUNNING') return 'กำลังทำงาน'
    return 'ว่าง'
  }

  const getTimeText = () => {
    if (machine.status === 'RUNNING') return `เหลือเวลา ${formatTime(timeRemaining)}`
    return null
  }

  const getStatusIcon = () => {
    if (machine.status === 'MAINTENANCE') return '🔧'
    if (machine.status === 'RUNNING') return '🔄' 
    return '🧺'
  }

  return (
    <div 
      className={`
        ${getCardColor()}
        text-white rounded-xl p-6 shadow-lg transform transition-all duration-200
        ${machine.status === 'AVAILABLE' ? 'hover:scale-105 cursor-pointer' : ''}
        ${isBlinking ? 'shadow-yellow-300 shadow-xl' : ''}
      `}
      onClick={() => machine.status === 'AVAILABLE' && onStartMachine(machine.id)}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">{getStatusIcon()}</div>
        <h3 className="text-xl font-bold mb-2">{machine.name}</h3>
        <p className="text-lg font-bold mb-1">{getStatusText()}</p>
        {getTimeText() && (
          <p className="text-md opacity-90">{getTimeText()}</p>
        )}
        
        {machine.status === 'AVAILABLE' && (
          <div className="mt-4">
            <p className="text-sm opacity-90">ราคา {machine.price.toString()} บาท</p>
            <p className="text-sm opacity-90">{machine.duration} นาที</p>
            <div className="mt-2 bg-white bg-opacity-20 rounded-lg py-2 px-4">
              <p className="text-sm font-medium text-gray-700">👆 แตะเพื่อเริ่มใช้งาน</p>
            </div>
          </div>
        )}
        
        {machine.status === 'RUNNING' && timeRemaining < 60 && timeRemaining > 0 && (
          <div className="mt-2 bg-yellow-600 rounded-lg py-1 px-3">
            <p className="text-xs font-bold">⚠️ กรุณาเตรียมมารับผ้า!</p>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Machine } from '@/types'
import MachineGrid from '@/components/MachineGrid'

export default function Home() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // อัพเดทเวลาปัจจุบันทุกวินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // โหลดข้อมูลเครื่องซักผ้า
  const fetchMachines = async () => {
    try {
      const response = await fetch('/api/machines')
      if (response.ok) {
        const data = await response.json()
        setMachines(data.map((machine: any) => ({
          ...machine,
          startTime: machine.startTime ? new Date(machine.startTime) : null,
          endTime: machine.endTime ? new Date(machine.endTime) : null
        })))
      }
    } catch (error) {
      console.error('Error fetching machines:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMachines()
    
    // รีเฟรชข้อมูลทุก 10 วินาที
    const interval = setInterval(fetchMachines, 10000)
    return () => clearInterval(interval)
  }, [])

  // สร้างข้อมูลเครื่องซักผ้าครั้งแรก (หากยังไม่มี)
  const initializeMachines = async () => {
    try {
      await fetch('/api/machines', { method: 'POST' })
      fetchMachines()
    } catch (error) {
      console.error('Error initializing machines:', error)
    }
  }

  const handleStartMachine = async (machineId: number) => {
    // จำลองการหยอดเหรียญ (20 บาท)
    try {
      const response = await fetch(`/api/machines/${machineId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 20 })
      })

      if (response.ok) {
        fetchMachines()
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      console.error('Error starting machine:', error)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-xl text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-2 sm:mb-0">
              <div className="text-3xl mr-3">🧺</div>
              <h1 className="text-2xl font-bold text-gray-800">ร้านซักรีดอัตโนมัติ</h1>
            </div>
            <div className="text-sm text-gray-600">
              {formatDateTime(currentTime)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {machines.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-xl text-gray-600 mb-4">ยังไม่มีเครื่องซักผ้า</p>
            <button 
              onClick={initializeMachines}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              เริ่มต้นระบบ
            </button>
          </div>
        ) : (
          <>
            <div className="max-w-4xl mx-auto px-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-700 text-center">
                เลือกเครื่องซักผ้าที่ต้องการใช้
              </h2>
            </div>
            <MachineGrid machines={machines} onStartMachine={handleStartMachine} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>ระบบจัดการร้านซักรีดอัตโนมัติ | Self-Service Laundromat</p>
      </footer>
    </div>
  )
}

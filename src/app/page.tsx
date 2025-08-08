'use client'

import { useState, useEffect } from 'react'
import { Machine } from '@/types'
import MachineGrid from '@/components/MachineGrid'
import CoinInsertModal from '@/components/CoinInsertModal'
import NotificationToast from '@/components/NotificationToast'
import { NotificationManager, Toast } from '@/lib/notification-utils'

export default function Home() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
  const [showCoinModal, setShowCoinModal] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [notificationManager] = useState(() => NotificationManager.getInstance())

  // Setup notifications
  useEffect(() => {
    // Subscribe to toast notifications
    const unsubscribe = notificationManager.subscribeToToasts(setToasts)
    
    // Request notification permission on load
    notificationManager.requestNotificationPermission()
    
    return unsubscribe
  }, [notificationManager])

  // อัพเดทเวลาปัจจุบันทุกวินาที + ตรวจสอบการแจ้งเตือน
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      
      // ตรวจสอบเครื่องที่เหลือเวลาน้อย
      machines.forEach(machine => {
        if (machine.status === 'RUNNING' && machine.endTime) {
          const now = new Date()
          const end = new Date(machine.endTime)
          const remainingSeconds = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
          
          // แจ้งเตือนเมื่อเหลือ 60 วินาที (ครั้งเดียว)
          if (remainingSeconds === 60) {
            notificationManager.notifyMachineAlmostFinished(machine.id, machine.name, remainingSeconds)
          }
          
          // แจ้งเตือนเมื่อเสร็จสิ้น
          if (remainingSeconds === 0) {
            notificationManager.notifyMachineFinished(machine.id, machine.name)
            // อัพเดทสถานะเครื่องเป็นว่าง
            updateMachineStatus(machine.id, 'AVAILABLE')
          }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [machines, notificationManager])

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

  // อัพเดทสถานะเครื่อง
  const updateMachineStatus = async (machineId: number, status: 'AVAILABLE' | 'RUNNING' | 'MAINTENANCE') => {
    try {
      await fetch(`/api/machines/${machineId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      fetchMachines()
    } catch (error) {
      console.error('Error updating machine status:', error)
    }
  }

  const handleStartMachine = (machineId: number) => {
    const machine = machines.find(m => m.id === machineId)
    if (machine) {
      setSelectedMachine(machine)
      setShowCoinModal(true)
    }
  }

  const handleCoinInsertConfirm = async (amount: number) => {
    if (!selectedMachine) return

    try {
      const response = await fetch(`/api/machines/${selectedMachine.id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount })
      })

      if (response.ok) {
        const result = await response.json()
        
        // แสดงข้อความสำเร็จ
        notificationManager.addToast(
          `🧺 ${selectedMachine.name} เริ่มทำงานแล้ว! ${result.change > 0 ? `เงินทอน: ${result.change} บาท` : ''}`,
          'success'
        )
        
        fetchMachines()
      } else {
        const error = await response.json()
        notificationManager.addToast(error.error, 'error')
      }
    } catch (error) {
      console.error('Error starting machine:', error)
      notificationManager.addToast('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error')
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
              <div className="text-3xl mr-3">🏪</div>
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

      {/* Modals and Notifications */}
      {selectedMachine && (
        <CoinInsertModal
          machine={selectedMachine}
          isOpen={showCoinModal}
          onClose={() => {
            setShowCoinModal(false)
            setSelectedMachine(null)
          }}
          onConfirm={handleCoinInsertConfirm}
        />
      )}
      
      <NotificationToast 
        toasts={toasts}
        onRemoveToast={(id) => notificationManager.removeToast(id)}
      />
    </div>
  )
}

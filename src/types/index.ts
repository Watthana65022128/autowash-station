export interface Machine {
  id: number
  name: string
  status: 'AVAILABLE' | 'RUNNING' | 'MAINTENANCE'
  startTime?: Date
  endTime?: Date
  duration: number
  price: number
  createdAt: Date
  updatedAt: Date
}

export interface MachineCardProps {
  machine: Machine
  onStartMachine: (machineId: number) => void
}

export interface NotificationData {
  message: string
  machineId: number
  type: 'warning' | 'success' | 'info'
}
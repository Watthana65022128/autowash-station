export interface Toast {
  id: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  duration?: number
}

export class NotificationManager {
  private static instance: NotificationManager
  private toastCallbacks: Array<(toasts: Toast[]) => void> = []
  private toasts: Toast[] = []
  private permissionRequested: boolean = false

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  // Toast Notifications
  addToast(message: string, type: Toast['type'] = 'info', duration: number = 10000): string {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const toast: Toast = { id, message, type, duration }
    
    this.toasts.push(toast)
    this.notifyToastCallbacks()
    
    return id
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notifyToastCallbacks()
  }

  subscribeToToasts(callback: (toasts: Toast[]) => void): () => void {
    this.toastCallbacks.push(callback)
    
    // Unsubscribe function
    return () => {
      this.toastCallbacks = this.toastCallbacks.filter(cb => cb !== callback)
    }
  }

  private notifyToastCallbacks(): void {
    this.toastCallbacks.forEach(callback => callback([...this.toasts]))
  }

  // Browser Notifications
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      this.addToast('การแจ้งเตือนถูกปิดใช้งาน กรุณาเปิดในการตั้งค่าเบราว์เซอร์', 'warning', 10000)
      return false
    }

    // Request permission
    if (!this.permissionRequested) {
      this.permissionRequested = true
      
      try {
        const permission = await Notification.requestPermission()
        
        if (permission === 'granted') {
          this.addToast('เปิดการแจ้งเตือนสำเร็จ! 🔔', 'success')
          return true
        } 
      } catch (error) {
        console.error('Error requesting notification permission:', error)
        return false
      }
    }
    
    return false
  }

  async showBrowserNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) return

    const hasPermission = await this.requestNotificationPermission()
    if (!hasPermission) return

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
        ...options
      })

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

    } catch (error) {
      console.error('Error showing browser notification:', error)
    }
  }

  // Machine Notifications
  notifyMachineAlmostFinished(machineId: number, machineName: string, secondsRemaining: number): void {
    const message = `🧺 ${machineName} เหลือเวลา ${secondsRemaining} วินาที กรุณาเตรียมมารับผ้า`
    
    // Show toast
    this.addToast(message, 'warning', 10000)
    
    // Show browser notification
    this.showBrowserNotification('แจ้งเตือนเครื่องซักผ้า', {
      body: message,
      tag: `machine-${machineId}-warning`
    })

    // Play sound
    this.playNotificationSound()
  }

  notifyMachineFinished(machineId: number, machineName: string): void {
    const message = `${machineName} ซักเสร็จแล้ว กรุณามารับผ้า`
    
    // Show toast
    this.addToast(message, 'success', 10000)
    
    // Show browser notification  
    this.showBrowserNotification('เครื่องซักผ้าเสร็จแล้ว', {
      body: message,
      tag: `machine-${machineId}-finished`
    })

    // Play sound
    this.playNotificationSound('finish')
  }

  // Sound Notifications
  playNotificationSound(type: 'warning' | 'finish' = 'warning'): void {
    try {
      const audio = new Audio()
      
      if (type === 'warning') {
        // Create warning beep sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 800
        oscillator.type = 'square'
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
        
      } else {
        // Create success sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator1 = audioContext.createOscillator()
        const oscillator2 = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator1.connect(gainNode)
        oscillator2.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator1.frequency.value = 523.25 // C5
        oscillator2.frequency.value = 659.25 // E5
        oscillator1.type = 'sine'
        oscillator2.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)
        
        oscillator1.start(audioContext.currentTime)
        oscillator2.start(audioContext.currentTime)
        oscillator1.stop(audioContext.currentTime + 1)
        oscillator2.stop(audioContext.currentTime + 1)
      }
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }
}
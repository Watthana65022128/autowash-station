'use client'

import { useState, useEffect } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  duration?: number
}

interface NotificationToastProps {
  toasts: Toast[]
  onRemoveToast: (id: string) => void
}

export default function NotificationToast({ toasts, onRemoveToast }: NotificationToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={() => onRemoveToast(toast.id)} 
        />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50)
    
    // Auto remove after duration
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onRemove, 300) // Wait for fade out animation
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast.duration, onRemove])

  const getToastStyles = () => {
    const baseStyles = "transform transition-all duration-300 ease-in-out rounded-lg shadow-lg p-4 min-w-80 max-w-md"
    
    const visibilityStyles = isVisible 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0"

    const typeStyles = {
      success: "bg-green-500 text-white",
      warning: "bg-yellow-500 text-white", 
      error: "bg-red-500 text-white",
      info: "bg-blue-500 text-white"
    }

    return `${baseStyles} ${visibilityStyles} ${typeStyles[toast.type]}`
  }

  const getIcon = () => {
    const icons = {
      success: "✅",
      warning: "❕", 
      error: "❌",
      info: "ℹ️"
    }
    return icons[toast.type]
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{getIcon()}</span>
          <p className="font-medium">{toast.message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onRemove, 300)
          }}
          className="ml-4 text-white hover:text-gray-200 font-bold text-lg leading-none"
        >
          ok
        </button>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Machine } from '@/types'

interface CoinInsertModalProps {
  machine: Machine
  isOpen: boolean
  onClose: () => void
  onConfirm: (amount: number) => void
}

export default function CoinInsertModal({ machine, isOpen, onClose, onConfirm }: CoinInsertModalProps) {
  const [selectedCoins, setSelectedCoins] = useState<{[key: number]: number}>({
    1: 0,
    5: 0,
    10: 0
  })

  const getTotalAmount = () => {
    return Object.entries(selectedCoins).reduce((total, [coin, count]) => {
      return total + (parseInt(coin) * count)
    }, 0)
  }

  const addCoin = (coinValue: number) => {
    setSelectedCoins(prev => ({
      ...prev,
      [coinValue]: prev[coinValue] + 1
    }))
  }

  const removeCoin = (coinValue: number) => {
    setSelectedCoins(prev => ({
      ...prev,
      [coinValue]: Math.max(0, prev[coinValue] - 1)
    }))
  }

  const clearAll = () => {
    setSelectedCoins({ 1: 0, 5: 0, 10: 0 })
  }

  const handleConfirm = () => {
    const total = getTotalAmount()
    if (total >= machine.price) {
      onConfirm(total)
      setSelectedCoins({ 1: 0, 5: 0, 10: 0 })
      onClose()
    }
  }

  const totalAmount = getTotalAmount()
  const requiredAmount = Number(machine.price)
  const changeAmount = totalAmount - requiredAmount
  const isInsufficientAmount = totalAmount < requiredAmount

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🪙</div>
          <h2 className="text-xl font-bold text-gray-800">หยอดเหรียญ</h2>
          <p className="text-gray-600">{machine.name}</p>
          <div className="bg-blue-50 rounded-lg p-3 mt-3">
            <p className="text-sm text-blue-600">ราคา: {machine.price} บาท | เวลา: {machine.duration} นาที</p>
          </div>
        </div>

        {/* Coin Selection */}
        <div className="space-y-4 mb-6">
          {[1, 5, 10].map(coinValue => (
            <div key={coinValue} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-2xl mr-3">
                  {coinValue === 1 ? '🥉' : coinValue === 5 ? '🥈' : '🥇'}
                </div>
                <div>
                  <p className="font-medium text-black">{coinValue} บาท</p>
                  <p className="text-sm text-gray-500">จำนวน: {selectedCoins[coinValue]}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => removeCoin(coinValue)}
                  className="w-8 h-8 rounded-full bg-red-500 text-white font-bold disabled:bg-gray-300"
                  disabled={selectedCoins[coinValue] === 0}
                >
                  -
                </button>
                <span className="w-8 text-center font-medium text-black">{selectedCoins[coinValue]}</span>
                <button
                  onClick={() => addCoin(coinValue)}
                  className="w-8 h-8 rounded-full bg-green-500 text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Amount Display */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">จำนวนเงินที่หยอด:</span>
            <span className="text-black font-bold text-lg">{totalAmount} บาท</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">ราคาที่ต้องจ่าย:</span>
            <span className="text-black font-medium">{requiredAmount} บาท</span>
          </div>
          {!isInsufficientAmount && changeAmount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>เงินทอน:</span>
              <span className="font-bold">{changeAmount} บาท</span>
            </div>
          )}
          {isInsufficientAmount && (
            <div className="text-red-500 text-center mt-2">
              <p className="font-medium">จำนวนเงินไม่เพียงพอ</p>
              <p className="text-sm">ต้องการอีก {requiredAmount - totalAmount} บาท</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={clearAll}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
            disabled={totalAmount === 0}
          >
            ล้างทั้งหมด
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            disabled={isInsufficientAmount}
            className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            เริ่มซัก
          </button>
        </div>
      </div>
    </div>
  )
}
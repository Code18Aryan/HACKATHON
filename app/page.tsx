'use client'

import LiveCropPrices from '@/components/LiveCropPrices'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-yellow-100 to-green-100 bg-clip-text text-transparent drop-shadow-2xl">
            🌾 Farmer's Portal
          </h1>
          <p className="text-xl text-white/90 mb-2 font-medium drop-shadow-md">Mandi Prices • Weather • News</p>
          <p className="text-sm text-white/80 drop-shadow-sm">Data source: Live API</p>
        </header>

        {/* Live Mandi Crop Prices */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg">
            Live Mandi Crop Prices
          </h2>
          <LiveCropPrices />
        </div>
      </div>
    </main>
  )
}


import { useState, useEffect } from 'react'
export default function TradeBlock() {
  const [trades, setTrades] = useState([])
  // Firebase integration will go here
  return (
    <div className="p-4 max-w-4xl mx-auto grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      <h1 className="text-xl font-bold mb-4 col-span-full">Trade Block</h1>
      {/* Placeholder trades */}
      <p className="text-gray-500 col-span-full">Trade posts will appear here.</p>
    </div>
  )
}

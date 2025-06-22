import { useState, useEffect } from 'react'
export default function MessageBoard() {
  const [posts, setPosts] = useState([])
  // Firebase integration will go here
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Message Board</h1>
      {/* Placeholder message */}
      <p className="text-gray-500">Posts will show up here once Firebase is configured.</p>
    </div>
  )
}

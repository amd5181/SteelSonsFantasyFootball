import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function MessageBoard() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, 'posts'))
      const results = []
      querySnapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() })
      })
      setPosts(results)
    }
    fetchPosts()
  }, [])

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Message Board</h1>
      {posts.map(post => (
        <div key={post.id} className="bg-white border p-4 mb-3 shadow rounded">
          <div className="text-sm font-semibold">{post.author}</div>
          <div>{post.content}</div>
        </div>
      ))}
    </div>
  )
}

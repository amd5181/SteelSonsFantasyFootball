import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function MessageBoard() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // 🔄 Live-sync with Firestore
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(docs);
    });
    return unsub; // detach listener on unmount
  }, []);

  const handlePost = async () => {
    const text = newMessage.trim();
    if (!text) return;

    await addDoc(collection(db, 'posts'), {
      text,
      createdAt: serverTimestamp(),
    });

    setNewMessage('');
  };

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Message Board</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Type your message…"
          className="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePost()}
        />
        <button
          onClick={handlePost}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Post
        </button>
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-gray-100 p-3 rounded-md">
              {msg.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

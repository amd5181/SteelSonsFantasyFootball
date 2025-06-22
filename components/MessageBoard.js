import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';

export default function MessageBoard() {
  /* UI state */
  const [messages, setMessages]   = useState([]);
  const [newMessage, setNewMsg]   = useState('');
  const [file, setFile]           = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');

  /* 🔄 Live-stream posts (order by createdAtLocal) */
  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAtLocal', 'desc')   // every doc gets this field
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  /* 📤 Upload & post */
  const handlePost = async () => {
    setError('');
    const text = newMessage.trim();
    if (!text && !file) return;

    setUploading(true);
    let mediaUrl = '';
    let mediaType = '';

    try {
      /* Upload file if present */
      if (file) {
        const ext = file.name.split('.').pop();
        const ref  = storageRef(storage, `posts/${Date.now()}.${ext}`);
        await uploadBytes(ref, file);
        mediaUrl  = await getDownloadURL(ref);
        mediaType = file.type.startsWith('video') ? 'video' : 'image';
      }

      /* Write Firestore doc */
      await addDoc(collection(db, 'posts'), {
        text,
        mediaUrl,
        mediaType,
        createdAtLocal: Date.now(),   // always present → sorting works
        createdAt: serverTimestamp(), // server authority
      });

      /* reset form  */
      setNewMsg('');
      setFile(null);
    } catch (err) {
      console.error(err);
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Message Board</h2>

      {/* ✏️ Compose */}
      <div className="space-y-2 mb-6">
        <input
          type="text"
          placeholder="Type your message…"
          className="w-full border border-gray-300 px-3 py-2 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newMessage}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handlePost()}
        />

        <input
          type="file"
          accept="image/*,video/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="block"
        />

        <button
          onClick={handlePost}
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md
                     hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Posting…' : 'Post'}
        </button>

        {error && <p className="text-red-600">{error}</p>}
      </div>

      {/* 📜 Posts */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="bg-gray-100 p-4 rounded-md">
              {msg.text && <p className="mb-2 whitespace-pre-wrap">{msg.text}</p>}

              {msg.mediaUrl && msg.mediaType === 'image' && (
                <img
                  src={msg.mediaUrl}
                  alt="post media"
                  className="max-w-full rounded"
                />
              )}

              {msg.mediaUrl && msg.mediaType === 'video' && (
                <video
                  src={msg.mediaUrl}
                  className="max-w-full rounded"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

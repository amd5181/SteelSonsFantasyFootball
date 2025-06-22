import React, { useState, useEffect, useRef } from 'react';
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
  const [messages, setMessages] = useState([]);
  const [author, setAuthor] = useState('');
  const [newMessage, setNewMsg] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const videoRefs = useRef({});

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAtLocal', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handlePost = async () => {
    setError('');
    const text = newMessage.trim();
    const name = author.trim();
    if (!text && !file) return;
    if (!name) {
      setError('Please enter your name.');
      return;
    }

    setUploading(true);
    let mediaUrl = '';
    let mediaType = '';

    try {
      if (file) {
        const ext = file.name.split('.').pop();
        const ref = storageRef(storage, `posts/${Date.now()}.${ext}`);
        await uploadBytes(ref, file);
        mediaUrl = await getDownloadURL(ref);
        mediaType = file.type.startsWith('video') ? 'video' : 'image';
      }

      await addDoc(collection(db, 'posts'), {
        author: name,
        text,
        mediaUrl,
        mediaType,
        createdAtLocal: Date.now(),
        createdAt: serverTimestamp(),
      });

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
          placeholder="Your name"
          className="w-full border border-gray-300 px-3 py-2 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />

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
              {msg.author && (
                <p className="text-sm font-semibold text-gray-700 mb-1">{msg.author}</p>
              )}
              {msg.text && (
                <p className="mb-2 whitespace-pre-wrap">{msg.text}</p>
              )}

              {msg.mediaUrl && msg.mediaType === 'image' && (
                <img
                  src={msg.mediaUrl}
                  alt="post media"
                  className="max-w-full rounded"
                />
              )}

              {msg.mediaUrl && msg.mediaType === 'video' && (
                <video
                  ref={el => videoRefs.current[msg.id] = el}
                  src={msg.mediaUrl}
                  className="max-w-full rounded cursor-pointer"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  onClick={() => {
                    const vid = videoRefs.current[msg.id];
                    if (vid) {
                      vid.muted = !vid.muted;
                    }
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

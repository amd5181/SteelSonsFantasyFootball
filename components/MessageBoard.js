import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';

const EMOJIS = ['❤️', '😂', '🔥', '👎'];

export default function MessageBoard() {
  const [messages, setMessages] = useState([]);
  const [author, setAuthor]     = useState('');
  const [newMessage, setNewMsg] = useState('');
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const videoRefs = useRef({});
  const [muteMap, setMuteMap] = useState({});   // msgId → bool (true = muted)

  /* 🔄 live stream */
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAtLocal', 'desc'));
    return onSnapshot(q, snap =>
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  /* 📨 new post */
  const handlePost = async () => {
    setError('');
    const text = newMessage.trim();
    const name = author.trim();
    if (!text && !file) return;
    if (!name)           { setError('Please enter your name.'); return; }

    setUploading(true);
    let mediaUrl = '', mediaType = '';

    try {
      if (file) {
        const ext = file.name.split('.').pop();
        const ref = storageRef(storage, `posts/${Date.now()}.${ext}`);
        await uploadBytes(ref, file);
        mediaUrl  = await getDownloadURL(ref);
        mediaType = file.type.startsWith('video') ? 'video' : 'image';
      }

      await addDoc(collection(db, 'posts'), {
        author: name,
        text,
        mediaUrl,
        mediaType,
        reactions: {},                    // 👍 😂 🔥 counts live here
        createdAtLocal: Date.now(),
        createdAt: serverTimestamp(),
      });

      setNewMsg(''); setFile(null);
    } catch (err) {
      console.error(err); setError('Upload failed. Try again.');
    } finally { setUploading(false); }
  };

  /* 😀 react to a post */
  const handleReact = async (id, emoji) => {
    try {
      await updateDoc(doc(db, 'posts', id), {
        [`reactions.${emoji}`]: increment(1),
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Message Board</h2>

      {/* ✏️ compose */}
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

      {/* 📜 posts */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="bg-gray-100 p-4 rounded-md">
              {msg.author && (
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {msg.author}
                </p>
              )}
              {msg.text && (
                <p className="mb-2 whitespace-pre-wrap">{msg.text}</p>
              )}

              {/* 🖼️ image */}
              {msg.mediaUrl && msg.mediaType === 'image' && (
                <img
                  src={msg.mediaUrl}
                  alt="post media"
                  className="max-w-full rounded"
                />
              )}

              {/* 🎥 video with mute toggle + watermark */}
              {msg.mediaUrl && msg.mediaType === 'video' && (
                <div className="relative">
                  <video
                    ref={el => (videoRefs.current[msg.id] = el)}
                    src={msg.mediaUrl}
                    className="w-full aspect-video rounded overflow-hidden cursor-pointer"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls={false}
                    onClick={() => {
                      const vid = videoRefs.current[msg.id];
                      if (!vid) return;
                      vid.muted = !vid.muted;
                      setMuteMap(prev => ({ ...prev, [msg.id]: vid.muted }));
                    }}
                  />
                  <div
                    className="absolute top-1 right-1 bg-black/60 text-white text-xs
                              px-1.5 py-0.5 rounded pointer-events-none select-none"
                  >
                    {muteMap[msg.id] ?? true ? '🔇' : '🔊'}
                  </div>
                </div>
              )}


              {/* 😀 reactions */}
              <div className="flex space-x-3 mt-2">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    className="flex items-center space-x-1 text-lg"
                    onClick={() => handleReact(msg.id, emoji)}
                  >
                    <span>{emoji}</span>
                    <span className="text-sm">
                      {msg.reactions?.[emoji] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

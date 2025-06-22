import React, { useState, useEffect, useRef } from 'react';
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp,
  updateDoc, doc, increment,
} from 'firebase/firestore';
import {
  ref as storageRef, uploadBytes, getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';

const EMOJIS = ['❤️', '😂', '🔥', '👎'];

export default function MessageBoard() {
  /* ── basic state ───────────────────────────────────────────── */
  const [messages, setMessages]   = useState([]);
  const [author, setAuthor]       = useState('');
  const [newMsg, setNewMsg]       = useState('');
  const [file, setFile]           = useState(null);
  const [err, setErr]             = useState('');
  const [uploading, setUploading] = useState(false);

  /* ── video / audio state ───────────────────────────────────── */
  const videoRefs        = useRef({});   // msgId → <video>
  const visibleRatiosRef = useRef({});   // msgId → ratio
  const [audioOn, setAudioOn]   = useState(false);
  const [activeId, setActiveId] = useState(null);

  /* 🔄 live stream */
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAtLocal', 'desc'));
    return onSnapshot(q, snap =>
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  /* 👁️ intersection logic */
  useEffect(() => {
    const vis = visibleRatiosRef.current;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          const id = e.target.dataset.msgid;
          if (e.intersectionRatio >= 0.25) vis[id] = e.intersectionRatio;
          else                            delete vis[id];
        });
        const best = Object.entries(vis)
          .sort((a, b) => b[1] - a[1])[0]?.[0];
        if (best && best !== activeId) setActiveId(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    Object.values(videoRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [messages, activeId]);

  /* 🔊 mute / unmute according to activeId + audioOn */
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, el]) => {
      if (!el) return;
      el.muted = !(audioOn && id === activeId);
    });
  }, [audioOn, activeId]);

  /* 📨 new post */
  const post = async () => {
    const text = newMsg.trim(), name = author.trim();
    if (!text && !file) return;
    if (!name) { setErr('Enter your name'); return; }
    setUploading(true); setErr('');

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
        author: name, text, mediaUrl, mediaType,
        reactions: {}, createdAtLocal: Date.now(),
        createdAt: serverTimestamp(),
      });
      setNewMsg(''); setFile(null);
    } catch { setErr('Upload failed'); }
    finally    { setUploading(false); }
  };

  /* 😀 react */
  const react = async (id, emoji) =>
    updateDoc(doc(db, 'posts', id), {
      [`reactions.${emoji}`]: increment(1),
    }).catch(console.error);

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Message Board</h2>

      {/* ── composer ────────────────────────── */}
      <div className="space-y-2 mb-6">
        <input
          className="w-full border px-3 py-2 rounded-md focus:ring-2 ring-blue-500"
          placeholder="Your name"
          value={author} onChange={e => setAuthor(e.target.value)}
        />
        <input
          className="w-full border px-3 py-2 rounded-md focus:ring-2 ring-blue-500"
          placeholder="Type your message…"
          value={newMsg} onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && post()}
        />
        <input
          type="file" accept="image/*,video/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={post} disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md
                     hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Posting…' : 'Post'}
        </button>
        {err && <p className="text-red-600">{err}</p>}
      </div>

      {/* ── posts ───────────────────────────── */}
      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className="bg-gray-100 p-4 rounded-md">
            {msg.author && (
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {msg.author}
              </p>
            )}
            {msg.text && <p className="mb-2 whitespace-pre-wrap">{msg.text}</p>}

            {/* image */}
            {msg.mediaUrl && msg.mediaType === 'image' && (
              <img src={msg.mediaUrl} alt="" className="max-w-full rounded" />
            )}

            {/* video */}
            {msg.mediaUrl && msg.mediaType === 'video' && (
              <div className="relative">
                <video
                  data-msgid={msg.id}
                  ref={el => (videoRefs.current[msg.id] = el)}
                  src={msg.mediaUrl}
                  className="w-full max-h-[95vh] md:w-[900px] md:max-h-[650px]
                             rounded cursor-pointer"
                  autoPlay loop muted playsInline controls={false}
                  onClick={() => {
                    if (!audioOn) setAudioOn(true); // first tap turns audio on
                    setActiveId(msg.id);           // make this one the focus
                  }}
                />
                <div
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs
                             px-1.5 py-0.5 rounded select-none pointer-events-none"
                >
                  {audioOn && activeId === msg.id ? '🔊' : '🔇'}
                </div>
              </div>
            )}

            {/* reactions */}
            <div className="flex space-x-3 mt-2">
              {EMOJIS.map(e => (
                <button key={e}
                  className="flex items-center space-x-1 text-lg"
                  onClick={() => react(msg.id, e)}
                >
                  <span>{e}</span>
                  <span className="text-sm">{msg.reactions?.[e] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

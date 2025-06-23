'use client';
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
  const [author, setAuthor] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const [mode, setMode] = useState('upload');
  const [file, setFile] = useState(null);
  const [embedURL, setEmbedURL] = useState('');
  const [err, setErr] = useState('');
  const [uploading, setUploading] = useState(false);

  const videoRefs = useRef({});
  const visibleRatiosRef = useRef({});
  const [audioOn, setAudioOn] = useState(false);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAtLocal', 'desc'));
    return onSnapshot(q, snap =>
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  useEffect(() => {
    const vis = visibleRatiosRef.current;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          const id = e.target.dataset.msgid;
          if (e.intersectionRatio >= 0.25) vis[id] = e.intersectionRatio;
          else delete vis[id];
        });
        const entriesSorted = Object.entries(vis).sort((a, b) => b[1] - a[1]);
        const best = entriesSorted[0]?.[0] || null;
        if (best !== activeId) setActiveId(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    Object.values(videoRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [messages, activeId]);

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, el]) => {
      if (!el) return;
      const shouldHaveAudio = audioOn && id === activeId;
      el.muted = !shouldHaveAudio;
      el.play().catch(() => {});
    });
  }, [audioOn, activeId]);

  useEffect(() => {
    Object.values(videoRefs.current).forEach(el => {
      if (el && el.paused) el.play().catch(() => {});
    });
  }, [messages]);

  const post = async () => {
    const text = newMsg.trim();
    const name = author.trim();
    if (!text && ((mode === 'upload' && !file) || (mode === 'embed' && !embedURL.trim()))) return;
    if (!name) { setErr('Enter your name'); return; }

    setUploading(true); setErr('');
    let mediaUrl = '', mediaType = '';
    try {
      if (mode === 'upload' && file) {
        const ext = file.name.split('.').pop();
        const ref = storageRef(storage, `posts/${Date.now()}.${ext}`);
        await uploadBytes(ref, file);
        mediaUrl = await getDownloadURL(ref);
        mediaType = file.type.startsWith('video') ? 'video' : 'image';
      }
      if (mode === 'embed' && embedURL.trim()) {
        mediaUrl = embedURL.trim();
        const isYouTube = /youtube\.com|youtu\.be/.test(mediaUrl);
        const isVimeo = /vimeo\.com/.test(mediaUrl);
        const isImg = /\.(gif|jpe?g|png|webp)$/i.test(mediaUrl);
        if (isYouTube) {
          const id = mediaUrl.split(/v=|youtu\.be\//)[1]?.split(/[?&]/)[0];
          mediaUrl = `https://www.youtube.com/embed/${id}`;
          mediaType = 'embed-video';
        } else if (isVimeo) {
          const id = mediaUrl.split('/').pop();
          mediaUrl = `https://player.vimeo.com/video/${id}`;
          mediaType = 'embed-video';
        } else if (isImg) {
          mediaType = 'embed-image';
        } else {
          mediaType = 'embed-image';
        }
      }
      await addDoc(collection(db, 'posts'), {
        author: name, text, mediaUrl, mediaType,
        reactions: {}, createdAtLocal: Date.now(),
        createdAt: serverTimestamp(),
      });
      setNewMsg(''); setFile(null); setEmbedURL('');
    } catch {
      setErr('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const react = (id, emoji) => updateDoc(doc(db, 'posts', id), {
    [`reactions.${emoji}`]: increment(1),
  }).catch(console.error);

  return (
    <div className="bg-white text-black px-2 sm:px-4 md:px-6 py-6 sm:rounded-lg shadow-md w-full max-w-none sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Message Board</h2>
      <div className="space-y-2 mb-6">
        <input className="w-full border px-3 py-2 rounded-md focus:ring-2 ring-blue-500" placeholder="Your name" value={author} onChange={e => setAuthor(e.target.value)} />
        <div className="flex space-x-4 text-sm">
          {['upload', 'embed'].map(m => (
            <button key={m} onClick={() => setMode(m)} className={`px-3 py-1 rounded-full ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{m === 'upload' ? 'Upload file' : 'Embed link'}</button>
          ))}
        </div>
        {mode === 'upload' && <input type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files?.[0] || null)} />}
        {mode === 'embed' && <input className="w-full border px-3 py-2 rounded-md focus:ring-2 ring-blue-500" placeholder="Paste image / GIF / YouTube / Vimeo URL…" value={embedURL} onChange={e => setEmbedURL(e.target.value)} />}
        <textarea rows={3} className="w-full border px-3 py-2 rounded-md focus:ring-2 ring-blue-500" placeholder="Type your message…" value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && post()} />
        <button onClick={post} disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">{uploading ? 'Posting…' : 'Post'}</button>
        {err && <p className="text-red-600">{err}</p>}
      </div>
      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className="bg-gray-100 p-4 rounded-md">
            {msg.author && <p className="text-sm font-semibold text-gray-700 mb-1">{msg.author}</p>}
            {msg.text && <p className="mb-2 whitespace-pre-wrap">{msg.text}</p>}
            {msg.mediaUrl && msg.mediaType === 'image' && <img src={msg.mediaUrl} alt="" className="w-full rounded" />}
            {msg.mediaUrl && msg.mediaType === 'video' && (
              <div className="relative">
                <video
                  data-msgid={msg.id}
                  ref={el => (videoRefs.current[msg.id] = el)}
                  src={msg.mediaUrl}
                  className="w-full max-h-[95vh] md:max-h-[650px] rounded cursor-pointer"
                  autoPlay loop muted playsInline controls={false}
                  onClick={() => {
                    if (!audioOn) setAudioOn(true);
                    setActiveId(msg.id);
                  }}
                />
                <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded select-none pointer-events-none">
                  {audioOn && activeId === msg.id ? '🔊' : '🔇'}
                </div>
              </div>
            )}
            {msg.mediaUrl && msg.mediaType === 'embed-image' && <img src={msg.mediaUrl} alt="" className="w-full rounded" />}
            {msg.mediaUrl && msg.mediaType === 'embed-video' && (
              <div className="relative pb-[56.25%]">
                <iframe
                  src={msg.mediaUrl}
                  className="absolute inset-0 w-full h-full rounded"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="embedded video"
                />
              </div>
            )}
            <div className="flex space-x-3 mt-2">
              {EMOJIS.map(e => (
                <button key={e} className="flex items-center space-x-1 text-lg" onClick={() => react(msg.id, e)}>
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

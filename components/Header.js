import React, { useState, useEffect, useRef } from 'react';
'use client';
import React, { useState, useEffect, useRef, Fragment } from 'react';
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp,Add commentMore actions
  updateDoc, doc, increment,
@@ -13,115 +14,139 @@ const EMOJIS = ['❤️', '😂', '🔥', '👎'];
export default function MessageBoard() {
  /* ── basic state ───────────────────────────────────────────── */
  const [messages, setMessages]   = useState([]);
  const [author, setAuthor]       = useState('');
  const [newMsg, setNewMsg]       = useState('');
  const [file, setFile]           = useState(null);
  const [author,   setAuthor]     = useState('');
  const [newMsg,   setNewMsg]     = useState('');

  /* upload vs embed */
  const [mode, setMode]           = useState<'upload' | 'embed'>('upload');
  const [file, setFile]           = useState<File | null>(null);
  const [embedURL, setEmbedURL]   = useState('');

  const [err, setErr]             = useState('');
  const [uploading, setUploading] = useState(false);

  /* ── video / audio state ───────────────────────────────────── */
  const videoRefs        = useRef({});   // msgId → <video>
  const visibleRatiosRef = useRef({});   // msgId → ratio
  const [audioOn, setAudioOn]   = useState(false);
  const [activeId, setActiveId] = useState(null);

  /* 🔄 live stream */
  /* ── live stream ───────────────────────────────────────────── */
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

  /* 🔊 ensure only active clip is un-muted AND playing */
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, el]) => {
      if (!el) return;

      const shouldHaveAudio = audioOn && id === activeId;
      el.muted = !shouldHaveAudio;

      if (shouldHaveAudio) {
        // some browsers pause when we un-mute; make sure it plays
        el.play().catch(() => {});  // ignore “already playing” errors
      }
    });
  }, [audioOn, activeId]);


  /* 📨 new post */
  const post = async () => {
    const text = newMsg.trim(), name = author.trim();
    if (!text && !file) return;
    if (!text && mode === 'upload' && !file && mode === 'embed' && !embedURL.trim()) return;
    if (!name) { setErr('Enter your name'); return; }
    setUploading(true); setErr('');

    let mediaUrl = '', mediaType = '';

    try {
      if (file) {
      if (mode === 'upload' && file) {
        const ext = file.name.split('.').pop();
        const ref = storageRef(storage, `posts/${Date.now()}.${ext}`);
        await uploadBytes(ref, file);
        mediaUrl  = await getDownloadURL(ref);
        mediaType = file.type.startsWith('video') ? 'video' : 'image';
      }

      if (mode === 'embed' && embedURL.trim()) {
        mediaUrl = embedURL.trim();
        const isYouTube = /youtube\.com|youtu\.be/.test(mediaUrl);
        const isVimeo   = /vimeo\.com/.test(mediaUrl);
        const isImg     = /\.(gif|jpe?g|png|webp)$/i.test(mediaUrl);

        if (isYouTube) {
          // convert to embed URL
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
          mediaType = 'embed-image'; // fallback, let browser try
        }
      }

      await addDoc(collection(db, 'posts'), {
        author: name, text, mediaUrl, mediaType,
        reactions: {}, createdAtLocal: Date.now(),
        createdAt: serverTimestamp(),
      });
      setNewMsg(''); setFile(null);
    } catch { setErr('Upload failed'); }
    finally    { setUploading(false); }

      // reset form
      setNewMsg('');
      setFile(null);
      setEmbedURL('');
    } catch {
      setErr('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  /* 😀 react */
  const react = async (id, emoji) =>
  const react = (id: string, emoji: string) =>
    updateDoc(doc(db, 'posts', id), {
      [`reactions.${emoji}`]: increment(1),
    }).catch(console.error);

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Message Board</h2>

      {/* ── composer ────────────────────────── */}
      {/* composer */}
      <div className="space-y-2 mb-6">
        <input
          className="w-full border px-3 py-2 rounded-md focus:ring-2 ring-blue-500"
          placeholder="Your name"
          value={author} onChange={e => setAuthor(e.target.value)}
        />

        {/* mode switch */}
        <div className="flex space-x-4 text-sm">
          {['upload', 'embed'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m as any)}
              className={`px-3 py-1 rounded-full ${
                mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {m === 'upload' ? 'Upload file' : 'Embed link'}
            </button>
          ))}
        </div>

        {mode === 'upload' && (
          <input
            type="file" accept="image/*,video/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        )}

        {mode === 'embed' && (
          <input
            className="w-full border px-3 py-2 rounded-md focus:ring-2 ring-blue-500"
            placeholder="Paste image / GIF / YouTube / Vimeo URL…"
            value={embedURL}
            onChange={e => setEmbedURL(e.target.value)}
          />
        )}

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
@@ -132,7 +157,7 @@ export default function MessageBoard() {
        {err && <p className="text-red-600">{err}</p>}
      </div>

      {/* ── posts ───────────────────────────── */}
      {/* posts */}
      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className="bg-gray-100 p-4 rounded-md">
@@ -143,32 +168,35 @@ export default function MessageBoard() {
            )}
            {msg.text && <p className="mb-2 whitespace-pre-wrap">{msg.text}</p>}

            {/* image */}
            {/* upload-image */}
            {msg.mediaUrl && msg.mediaType === 'image' && (
              <img src={msg.mediaUrl} alt="" className="max-w-full rounded" />
            )}

            {/* video */}
            {/* upload-video */}
            {msg.mediaUrl && msg.mediaType === 'video' && (
              <div className="relative">
                <video
                  data-msgid={msg.id}
                  ref={el => (videoRefs.current[msg.id] = el)}
              <video
                src={msg.mediaUrl}
                className="w-full max-h-[95vh] md:w-[900px] md:max-h-[650px] rounded"
                autoPlay loop muted playsInline controls
              />
            )}

            {/* embed-image */}
            {msg.mediaUrl && msg.mediaType === 'embed-image' && (
              <img src={msg.mediaUrl} alt="" className="max-w-full rounded" />
            )}

            {/* embed-video */}
            {msg.mediaUrl && msg.mediaType === 'embed-video' && (
              <div className="relative pb-[56.25%]">
                <iframe
                  src={msg.mediaUrl}
                  className="w-full max-h-[95vh] md:w-[900px] md:max-h-[650px]
                             rounded cursor-pointer"
                  autoPlay loop muted playsInline controls={false}
                  onClick={() => {
                    if (!audioOn) setAudioOn(true); // first tap turns audio on
                    setActiveId(msg.id);           // make this one the focus
                  }}
                  className="absolute inset-0 w-full h-full rounded"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="embedded video"
                />
                <div
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs
                             px-1.5 py-0.5 rounded select-none pointer-events-none"
                >
                  {audioOn && activeId === msg.id ? '🔊' : '🔇'}
                </div>
              </div>
            )}

@@ -180,7 +208,9 @@ export default function MessageBoard() {
                  onClick={() => react(msg.id, e)}
                >
                  <span>{e}</span>
                  <span className="text-sm">{msg.reactions?.[e] ?? 0}</span>
                  <span className="text-sm">
                    {msg.reactions?.[e] ?? 0}
                  </span>
                </button>
              ))}
            </div>

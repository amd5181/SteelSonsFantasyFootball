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

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)} - ${date.getHours() % 12 || 12}:${date.getMinutes().toString().padStart(2, '0')}${date.getHours() >= 12 ? 'p' : 'a'}`;
}

export default function MessageBoard() {
  const [messages, setMessages] = useState([]);
  const [author, setAuthor] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const [mode, setMode] = useState('upload');
  const [file, setFile] = useState(null);
  const [embedURL, setEmbedURL] = useState('');
  const [err, setErr] = useState('');
  const [uploading, setUploading] = useState(false);

  const [postType, setPostType] = useState('general');
  const [tradeWant, setTradeWant] = useState('');
  const [tradeGive, setTradeGive] = useState('');
  const [tradeDeadline, setTradeDeadline] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const videoRefs = useRef({});
  const visibleRatiosRef = useRef({});
  const [audioOn, setAudioOn] = useState(true);
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
    if (!name) { setErr('Enter your name'); return; }

    let mediaUrl = '', mediaType = '';
    if (postType === 'general') {
      if (!text && ((mode === 'upload' && !file) || (mode === 'embed' && !embedURL.trim()))) return;
    } else if (postType === 'poll') {
      if (!pollQuestion || pollOptions.filter(Boolean).length < 2) {
        setErr('Poll must have a question and at least 2 options');
        return;
      }
    }

    setUploading(true); setErr('');
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

      const postData = {
        author: name,
        postType,
        createdAtLocal: Date.now(),
        createdAt: serverTimestamp(),
        reactions: {},
      };

      if (postType === 'general') {
        postData.text = text;
        postData.mediaUrl = mediaUrl;
        postData.mediaType = mediaType;
      } else if (postType === 'trade') {
        postData.want = tradeWant;
        postData.give = tradeGive;
        postData.deadline = tradeDeadline;
      } else if (postType === 'poll') {
        postData.pollQuestion = pollQuestion;
        postData.pollOptions = pollOptions.filter(Boolean);
        postData.votes = {};
      }

      await addDoc(collection(db, 'posts'), postData);
      setNewMsg(''); setFile(null); setEmbedURL('');
      setTradeWant(''); setTradeGive(''); setTradeDeadline('');
      setPollQuestion(''); setPollOptions(['', '']);
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
    <div className="text-black w-full max-w-none px-0 sm:px-0 overflow-x-hidden">
      <h2 className="text-2xl font-bold mb-4 px-4 pt-6 text-center text-yellow-500 cursor-pointer" onClick={() => setAudioOn(!audioOn)}>
        Message Board
      </h2>
      <div className="space-y-2 mb-6 px-4">
        <select className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500" value={postType} onChange={e => setPostType(e.target.value)}>
          <option value="general">📝 General Post</option>
          <option value="trade">💰 Trade Block</option>
          <option value="poll">📊 Poll</option>
        </select>

        <input className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500" placeholder="Your name" value={author} onChange={e => setAuthor(e.target.value)} />

        {postType === 'general' && <>
          <textarea rows={3} className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500" placeholder="Type your message…" value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && post()} />
          <div className="flex space-x-4 text-sm">
            {['upload', 'embed'].map(m => (
              <button key={m} onClick={() => setMode(m)} className={`px-3 py-1 rounded-full ${mode === m ? 'bg-yellow-500 text-black' : 'bg-white text-black border border-gray-300'}`}>{m === 'upload' ? 'Upload file' : 'Embed link'}</button>
            ))}
          </div>
          {mode === 'upload' && <input type="file" accept="image/*,video/*" className="text-yellow-700 text-lg" onChange={e => setFile(e.target.files?.[0] || null)} />}
          {mode === 'embed' && <input className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500" placeholder="Paste image / GIF / YouTube / Vimeo URL…" value={embedURL} onChange={e => setEmbedURL(e.target.value)} />}
        </>}

        {postType === 'trade' && <>
          <input className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500" placeholder="Players you want" value={tradeWant} onChange={e => setTradeWant(e.target.value)} />
          <input className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500" placeholder="Players you're willing to trade" value={tradeGive} onChange={e => setTradeGive(e.target.value)} />
          <input className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500" placeholder="Optional deadline (e.g., Sunday 1pm)" value={tradeDeadline} onChange={e => setTradeDeadline(e.target.value)} />
        </>}

        {postType === 'poll' && <>
          <input className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500" placeholder="Poll question" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} />
          {pollOptions.map((opt, idx) => (
            <input key={idx} className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500 mb-1" placeholder={`Option ${idx + 1}`} value={opt} onChange={e => {
              const newOpts = [...pollOptions];
              newOpts[idx] = e.target.value;
              setPollOptions(newOpts);
            }} />
          ))}
          <button onClick={() => setPollOptions([...pollOptions, ''])} className="text-sm text-blue-600 underline">Add Option</button>
        </>}

        <button onClick={post} disabled={uploading} className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50 mt-2">{uploading ? 'Posting…' : 'Post'}</button>
        {err && <p className="text-red-600">{err}</p>}
      </div>

      <div className="space-y-4 px-4">
        {messages.map(msg => (
          <div key={msg.id} className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              {msg.author && <p className="text-sm font-semibold text-gray-700 mb-1">{msg.author}</p>}
              {msg.createdAtLocal && <p className="text-xs text-gray-500 ml-2">{formatTime(msg.createdAtLocal)}</p>}
            </div>
            {msg.postType === 'general' && msg.text && <p className="mb-2 whitespace-pre-wrap">{msg.text}</p>}
            {msg.postType === 'trade' && <div className="text-sm">
              <p><strong>Wants:</strong> {msg.want}</p>
              <p><strong>Offering:</strong> {msg.give}</p>
              {msg.deadline && <p><strong>Deadline:</strong> {msg.deadline}</p>}
            </div>}
            {msg.postType === 'poll' && <div>
              <p className="font-semibold mb-1">{msg.pollQuestion}</p>
              {msg.pollOptions?.map((opt, i) => (
                <p key={i}>- {opt}</p>
              ))}
            </div>}
            {/* Existing media and emoji code stays */}
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

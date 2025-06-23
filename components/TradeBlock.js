'use client';
import React, { useState, useEffect } from 'react';
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
import { db } from '../lib/firebase';

const EMOJIS = ['❤️', '😂', '👎'];        // like, laugh, dislike

function formatTime(ts) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)} - ` +
         `${d.getHours() % 12 || 12}:${d.getMinutes().toString().padStart(2, '0')}` +
         `${d.getHours() >= 12 ? 'p' : 'a'}`;
}

export default function TradeBlock() {
  /* ─── form state ─────────────────────────────────────────────────────── */
  const [managerName, setManagerName] = useState('');
  const [want, setWant] = useState('');
  const [willing, setWilling] = useState('');
  const [comments, setComments] = useState('');
  const [deadline, setDeadline] = useState('');

  /* ─── listings state ─────────────────────────────────────────────────── */
  const [posts, setPosts] = useState([]);

  /* ─── live subscription ──────────────────────────────────────────────── */
  useEffect(() => {
    const q = query(collection(db, 'tradeBlock'), orderBy('createdAtLocal', 'desc'));
    return onSnapshot(q, snap =>
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  /* ─── create listing ─────────────────────────────────────────────────── */
  const submit = async () => {
    const n = managerName.trim();
    if (!n) return;
    if (!want.trim() && !willing.trim() && !comments.trim()) return;

    await addDoc(collection(db, 'tradeBlock'), {
      managerName: n,
      want: want.trim(),
      willingToTrade: willing.trim(),
      comments: comments.trim(),
      deadline: deadline ? new Date(deadline).getTime() : null,
      reactions: {},
      createdAtLocal: Date.now(),
      createdAt: serverTimestamp(),
    });

    // reset
    setWant(''); setWilling(''); setComments(''); setDeadline('');
  };

  /* ─── react to a listing ─────────────────────────────────────────────── */
  const react = (id, emoji) =>
    updateDoc(doc(db, 'tradeBlock', id), {
      [`reactions.${emoji}`]: increment(1),
    }).catch(console.error);

  /* ─── UI ─────────────────────────────────────────────────────────────── */
  return (
    <div className="text-black w-full max-w-none px-0 sm:px-0 overflow-x-hidden">
      <h2
        className="text-2xl font-bold mb-4 px-4 pt-6 text-center text-yellow-500"
      >
        Trade Block
      </h2>

      {/* ─── form ─────────────────────────────────────────────────────── */}
      <div className="space-y-2 mb-6 px-4">
        <input
          className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500"
          placeholder="Manager Name"
          value={managerName}
          onChange={e => setManagerName(e.target.value)}
        />
        <input
          className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500"
          placeholder="Want (positions or players)"
          value={want}
          onChange={e => setWant(e.target.value)}
        />
        <input
          className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500"
          placeholder="Willing to Trade (positions or players)"
          value={willing}
          onChange={e => setWilling(e.target.value)}
        />
        <textarea
          rows={3}
          className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500"
          placeholder="Comments (max 500 chars)"
          value={comments}
          maxLength={500}
          onChange={e => setComments(e.target.value)}
        />
        <label className="block text-sm text-gray-600">Deadline for Offers</label>
        <input
          type="date"
          className="w-full bg-white text-black border px-3 py-2 rounded-md focus:ring-2 ring-yellow-500"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
        />

        <button
          onClick={submit}
          className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600"
        >
          Post
        </button>
      </div>

      {/* ─── listings ──────────────────────────────────────────────────── */}
      <div className="space-y-4 px-4">
        {posts.map(p => (
          <div key={p.id} className="bg-white rounded-lg p-4">
            {/* header row */}
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {p.managerName}
              </p>
              {p.createdAtLocal && (
                <p className="text-xs text-gray-500 ml-2">
                  {formatTime(p.createdAtLocal)}
                </p>
              )}
            </div>

            {/* body */}
            {p.want && (
              <p className="mb-1">
                <strong>Want:</strong> {p.want}
              </p>
            )}
            {p.willingToTrade && (
              <p className="mb-1">
                <strong>Willing to Trade:</strong> {p.willingToTrade}
              </p>
            )}
            {p.comments && (
              <p className="mb-1 whitespace-pre-wrap">{p.comments}</p>
            )}
            {p.deadline && (
              <p className="mb-1 text-sm text-gray-600">
                <strong>Offer Deadline:</strong>{' '}
                {formatTime(p.deadline)}
              </p>
            )}

            {/* reactions */}
            <div className="flex space-x-3 mt-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  className="flex items-center space-x-1 text-lg"
                  onClick={() => react(p.id, e)}
                >
                  <span>{e}</span>
                  <span className="text-sm">
                    {p.reactions?.[e] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

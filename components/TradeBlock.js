// TradeBlock.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  increment
} from 'firebase/firestore';

export default function TradeBlock() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({
    managerName: '',
    want: '',
    willingToTrade: '',
    comments: '',
    deadline: ''
  });

  const fetchPosts = async () => {
    const snapshot = await getDocs(collection(db, 'tradeBlock'));
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const post = {
      ...form,
      deadline: form.deadline ? new Date(form.deadline) : null,
      createdAt: serverTimestamp(),
      reactions: { like: 0, laugh: 0, dislike: 0 }
    };
    await addDoc(collection(db, 'tradeBlock'), post);
    setForm({ managerName: '', want: '', willingToTrade: '', comments: '', deadline: '' });
    fetchPosts();
  };

  const reactToPost = async (id, type) => {
    const ref = doc(db, 'tradeBlock', id);
    await updateDoc(ref, {
      [`reactions.${type}`]: increment(1)
    });
    fetchPosts();
  };

  return (
    <div
      className="mt-24 p-4 max-w-3xl mx-auto space-y-8 overscroll-none bg-gray-100 dark:bg-neutral-900 min-h-screen"
      style={{ overscrollBehavior: 'none' }}
    >
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Trade Block</h1>
      className="mt-24 p-4 max-w-3xl mx-auto space-y-8 overscroll-none bg-gray-100 dark:bg-neutral-900 min-h-screen"
      style={{ overscrollBehavior: 'none' }}
    >
      {/* ─── Trade Post Form ──────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 border p-4 rounded-xl shadow bg-white dark:bg-zinc-800"
      >
        <input
          placeholder="Manager Name"
          className="w-full p-2 border rounded"
          value={form.managerName}
          onChange={(e) => setForm({ ...form, managerName: e.target.value })}
          required
        />
        <input
          placeholder="Want (positions or players)"
          className="w-full p-2 border rounded"
          value={form.want}
          onChange={(e) => setForm({ ...form, want: e.target.value })}
          required
        />
        <input
          placeholder="Willing to Trade (positions or players)"
          className="w-full p-2 border rounded"
          value={form.willingToTrade}
          onChange={(e) => setForm({ ...form, willingToTrade: e.target.value })}
          required
        />
        <textarea
          placeholder="Comments (max 500 chars)"
          className="w-full p-2 border rounded"
          maxLength={500}
          value={form.comments}
          onChange={(e) => setForm({ ...form, comments: e.target.value })}
        />
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>

      {/* ─── Trade Post Cards ─────────────────────────────────────────────── */}
      {posts.map((post) => (
        <div key={post.id} className="border p-4 rounded-xl shadow space-y-2 bg-white dark:bg-zinc-800">
          <div className="font-bold text-lg">{post.managerName}</div>
          <div>
            <strong>Want:</strong> {post.want}
          </div>
          <div>
            <strong>Willing to Trade:</strong> {post.willingToTrade}
          </div>
          {post.comments && (
            <div>
              <strong>Comments:</strong> {post.comments}
            </div>
          )}
          {post.deadline && (
            <div>
              <strong>Offer Deadline:</strong>{' '}
              {post.deadline.seconds
                ? new Date(post.deadline.seconds * 1000).toLocaleDateString()
                : new Date(post.deadline).toLocaleDateString()}
            </div>
          )}
          <div className="text-sm text-gray-500">
            Posted:{' '}
            {post.createdAt?.seconds
              ? new Date(post.createdAt.seconds * 1000).toLocaleString()
              : 'just now'}
          </div>

          <div className="flex space-x-4 pt-2">
            <button
              onClick={() => reactToPost(post.id, 'like')}
              className="hover:scale-110"
            >
              ❤️ {post.reactions?.like || 0}
            </button>
            <button
              onClick={() => reactToPost(post.id, 'laugh')}
              className="hover:scale-110"
            >
              😂 {post.reactions?.laugh || 0}
            </button>
            <button
              onClick={() => reactToPost(post.id, 'dislike')}
              className="hover:scale-110"
            >
              👎 {post.reactions?.dislike || 0}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

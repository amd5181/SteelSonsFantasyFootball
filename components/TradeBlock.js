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
  increment,
} from 'firebase/firestore';

export default function TradeBlock() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({
    managerName: '',
    want: '',
    willingToTrade: '',
    comments: '',
    deadline: '',
  });

  const fetchPosts = async () => {
    const snapshot = await getDocs(collection(db, 'tradeBlock'));
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    data.sort(
      (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );
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
      reactions: { like: 0, laugh: 0, dislike: 0 },
    };
    await addDoc(collection(db, 'tradeBlock'), post);
    setForm({
      managerName: '',
      want: '',
      willingToTrade: '',
      comments: '',
      deadline: '',
    });
    fetchPosts();
  };

  const reactToPost = async (id, type) => {
    const ref = doc(db, 'tradeBlock', id);
    await updateDoc(ref, {
      [`reactions.${type}`]: increment(1),
    });
    fetchPosts();
  };

  return (
    <div className="mt-20 px-4 max-w-2xl mx-auto text-white min-h-screen bg-[#0d1117]">
      <h1 className="text-2xl font-bold text-center mb-4 text-yellow-400">
        Trade Block
      </h1>

      {/* ─── Post Form ───────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 bg-[#161b22] p-4 rounded-lg shadow"
      >
        <input
          placeholder="Your name"
          className="w-full p-2 rounded bg-white text-black"
          value={form.managerName}
          onChange={(e) => setForm({ ...form, managerName: e.target.value })}
          required
        />
        <textarea
          placeholder="Want (positions or players)"
          className="w-full p-2 rounded bg-white text-black"
          value={form.want}
          onChange={(e) => setForm({ ...form, want: e.target.value })}
          required
        />
        <textarea
          placeholder="Willing to Trade (positions or players)"
          className="w-full p-2 rounded bg-white text-black"
          value={form.willingToTrade}
          onChange={(e) =>
            setForm({ ...form, willingToTrade: e.target.value })
          }
          required
        />
        <textarea
          placeholder="Comments (max 500 chars)"
          className="w-full p-2 rounded bg-white text-black"
          maxLength={500}
          value={form.comments}
          onChange={(e) => setForm({ ...form, comments: e.target.value })}
        />
        <input
          type="date"
          className="w-full p-2 rounded bg-white text-black"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />
        <button
          type="submit"
          className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500"
        >
          Post
        </button>
      </form>

      {/* ─── Posts ───────────────────────────── */}
      <div className="mt-8 space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white text-black rounded-lg p-4 shadow space-y-2"
          >
            <div className="font-semibold">{post.managerName}</div>
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
            <div className="text-sm text-right text-gray-600">
              {post.createdAt?.seconds
                ? new Date(post.createdAt.seconds * 1000).toLocaleString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                : 'Just now'}
            </div>
            <div className="flex gap-4 text-xl pt-1">
              <button onClick={() => reactToPost(post.id, 'like')}>❤️ {post.reactions?.like || 0}</button>
              <button onClick={() => reactToPost(post.id, 'laugh')}>😂 {post.reactions?.laugh || 0}</button>
              <button onClick={() => reactToPost(post.id, 'dislike')}>👎 {post.reactions?.dislike || 0}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

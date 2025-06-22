import React, { useState, useEffect } from 'react';
import { getFirestore, getDocs, collection } from "firebase/firestore";
import { app } from "../firebase"; // or wherever you're initializing Firebase

export default function MessageBoard() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, "posts"));
      const data = snap.docs.map(doc => doc.data());
      setPosts(data);
    };

    loadPosts();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Message Board</h2>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <div
              key={i}
              className="bg-white shadow-md rounded-md p-4 border border-gray-200"
            >
              <h3 className="text-lg font-bold">{post.Author}</h3>
              <p className="mt-1 text-gray-700">{post.Content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

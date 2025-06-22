// MessageBoard.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // Adjust path as needed

export default function MessageBoard() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const snapshot = await getDocs(collection(db, "posts"));
      const postsData = snapshot.docs.map(doc => doc.data());
      setPosts(postsData);
    };

    fetchPosts();
  }, []);

  return (
    <div>
      {posts.length === 0 ? (
        <p>No posts yet</p>
      ) : (
        posts.map((post, idx) => (
          <div key={idx} className="mb-4 border p-4 rounded shadow">
            <h3 className="font-bold">{post.Author}</h3>
            <p>{post.Content}</p>
          </div>
        ))
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase"; // Ensure this is correct path to firebase init

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Message Board</h1>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post, i) => (
          <div key={i} className="border border-gray-300 rounded p-4 mb-3">
            <strong>{post.Author}</strong>
            <div>{post.Content}</div>
          </div>
        ))
      )}
    </div>
  );
}

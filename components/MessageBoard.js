import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase";

export default function MessageBoard() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, "posts"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    };

    loadPosts();
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-yellow-500 mb-6 text-center">Message Board</h1>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400">No posts yet.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-white border border-gray-300 rounded-xl shadow-md mb-6 p-4 space-y-2">
            <div className="text-sm text-gray-500">{new Date(post.timestamp?.seconds * 1000).toLocaleString()}</div>
            <div className="text-lg font-semibold text-black">{post.Author || "Unknown"}</div>
            <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">{post.Content}</div>
          </div>
        ))
      )}
    </div>
  );
}

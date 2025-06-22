import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase";

export default function MessageBoard() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, "posts"));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(data);
    };

    loadPosts();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-yellow-500">Message Board</h2>

      {posts.length === 0 ? (
        <p className="text-gray-400">No posts yet.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-2">
              <strong className="text-black">{post.Author || "Anonymous"}</strong>
              <span className="text-xs text-gray-500">
                {post.timestamp?.toDate
                  ? post.timestamp.toDate().toLocaleString()
                  : ""}
              </span>
            </div>
            <div className="text-gray-800 whitespace-pre-line">{post.Content}</div>
            {/* Media (image/video/audio) – coming soon */}
            {/* Reactions – coming soon */}
          </div>
        ))
      )}
    </div>
  );
}

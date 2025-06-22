import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase";

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
    <div className="space-y-4">
      {posts.length === 0 ? (
        <p className="text-gray-500 italic">No posts yet.</p>
      ) : (
        posts.map((post, i) => (
          <div key={i} className="bg-white shadow-md p-4 rounded-md">
            <div className="font-bold text-lg">{post.Author}</div>
            <p className="mt-2">{post.Content}</p>
          </div>
        ))
      )}
    </div>
  );
}

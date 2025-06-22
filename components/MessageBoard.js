import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase"; // point to the file you just made

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
    <div className="p-4">
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post, i) => (
          <div key={i} className="border p-3 mb-2">
            <strong>{post.Author}</strong>
            <div>{post.Content}</div>
          </div>
        ))
      )}
    </div>
  );
}

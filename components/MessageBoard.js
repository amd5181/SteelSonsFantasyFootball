import { useEffect, useState } from "react";
import { db } from "../firebase";          // path points to the file you created
import { collection, getDocs } from "firebase/firestore";

export default function MessageBoard() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "posts"));
      setPosts(snap.docs.map(d => d.data()));
    };
    load();
  }, []);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Message Board</h1>

      {posts.length === 0 && <p>No posts yet.</p>}

      {posts.map((p, i) => (
        <div key={i} className="border p-3 mb-3 rounded">
          <div className="font-semibold">{p.author}</div>
          <div>{p.content}</div>
        </div>
      ))}
    </div>
  );
}

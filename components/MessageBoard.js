import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase"; // adjust path if you're organizing files differently

export default function MessageBoard() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const db = getFirestore(app);
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postsData = querySnapshot.docs.map(doc => doc.data());
      setPosts(postsData);
    };

    fetchPosts();
  }, []);

  return (
    <div className="space-y-6 p-4">
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post, index) => (
          <div key={index} className="border rounded-xl p-4 bg-white shadow">
            <h3 className="font-bold">{post.author}</h3>
            <p>{post.content}</p>
          </div>
        ))
      )}
    </div>
  );
}

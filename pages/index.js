import Header from '../components/Header';
import MessageBoard from '../components/MessageBoard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 px-6 py-4">
      <Header />
      <main className="max-w-3xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Message Board</h2>
        <MessageBoard />
      </main>
    </div>
  );
}

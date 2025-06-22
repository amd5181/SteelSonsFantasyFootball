import React from 'react';
import Header from '../components/Header';
import MessageBoard from '../components/MessageBoard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <p className="text-red-500 text-xl font-bold text-center mt-4">
        Tailwind is working!
      </p>
      <main className="max-w-4xl mx-auto px-4 py-10">
        <MessageBoard />
      </main>
    </div>
  );
}

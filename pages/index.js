import React from 'react';
import Header from '../components/Header';
import MessageBoard from '../components/MessageBoard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <MessageBoard />
      </main>
    </div>
  );
}

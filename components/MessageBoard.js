import React, { useState } from 'react';

export default function MessageBoard() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handlePost = () => {
    if (newMessage.trim() === '') return;
    setMessages([{ text: newMessage, timestamp: Date.now() }, ...messages]);
    setNewMessage('');
  };

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Message Board</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePost()}
        />
        <button
          onClick={handlePost}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Post
        </button>
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="bg-gray-100 p-3 rounded-md">
              {msg.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

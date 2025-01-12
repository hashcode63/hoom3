'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  file: string | null;
}

const Chat = () => {
  const { id } = useParams() as { id: string }; // Type assertion added here
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() || file) {
      const message: Message = {
        id: uuidv4(),
        user: user?.username || 'Anonymous',
        content: newMessage,
        timestamp: new Date().toISOString(),
        file: file ? URL.createObjectURL(file) : null,
      };
      ws.current?.send(JSON.stringify(message));
      setNewMessage('');
      setFile(null);
    }
  };

  return (
    <section className="flex flex-col items-center p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Chat</h1>
      <div className="w-full max-w-2xl bg-dark-2 p-4 rounded-lg">
        <div className="messages-container h-64 overflow-y-scroll mb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="message mb-2">
              <strong>{msg.user}:</strong> {msg.content}
              {msg.file && <img src={msg.file} alt="file" className="mt-2" />}
              <span className="text-sm text-gray-400 ml-2">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 rounded-l-lg bg-dark-3 text-white"
            placeholder="Type your message..."
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="p-2 bg-dark-3 text-white"
          />
          <button onClick={handleSendMessage} className="p-2 bg-blue-1 rounded-r-lg text-white">
            Send
          </button>
        </div>
      </div>
    </section>
  );
};

export default Chat;
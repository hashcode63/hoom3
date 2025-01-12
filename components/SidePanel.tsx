import { FC, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

interface SidePanelProps {
  onClose: () => void;
}

const SidePanel: FC<SidePanelProps> = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messages);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        timestamp: new Date()
      });
      setNewMessage('');
    }
  };

  return (
    <div className="fixed top-0 right-0 h-full w-1/3 bg-gray-800 text-white shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">Chat</h2>
        <Button onClick={onClose} variant="ghost" className="text-white">
          Close
        </Button>
      </div>
      <div className="p-4 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="mb-2">
              <p>{message.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              console.log('Input value:', e.target.value); // Debugging log
              setNewMessage(e.target.value);
            }}
            className="flex-1 p-2 rounded bg-gray-700 text-white"
            placeholder="Type a message"
          />
          <Button onClick={handleSendMessage} className="ml-2">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
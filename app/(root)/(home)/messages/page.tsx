'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const Messages = () => {
  const { user } = useUser();
  const router = useRouter();
  interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
  }
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [contactsError, setContactsError] = useState('');

  useEffect(() => {
    if (user) {
      // Fetch Google contacts
      fetch('/api/contacts')
        .then((response) => response.json())
        .then((data) => {
          console.log('Google contacts:', data.contacts);
          setContacts(data.contacts || []);
        })
        .catch((error) => {
          console.error('Error fetching contacts:', error);
          setContacts([]);
        });

      // Fetch WhatsApp contacts
      fetch(`/api/whatsapp/contacts`)
        .then((response) => response.json())
        .then((data) => {
          console.log('WhatsApp contacts:', data.contacts);
          setContacts((prevContacts) => [...prevContacts, ...(data.contacts || [])]);
        })
        .catch((error) => {
          console.error('Error fetching WhatsApp contacts:', error);
          setContactsError(error.message);
        })
        .finally(() => {
          setLoadingContacts(false);
        });
    }
  }, [user]);

  const handleSendMessage = async (phoneNumber: string) => {
    if (!phoneNumber) {
      console.error('Phone number is undefined');
      return;
    }

    const message = prompt('Enter your message:');
    if (message) {
      await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, message }),
      });
    }
  };

  return (
    <section className="flex flex-col items-center p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Messages</h1>
      <div className="w-full max-w-2xl bg-dark-2 p-4 rounded-lg">
        <div className="contacts-container h-64 overflow-y-scroll mb-4">
          {loadingContacts ? (
            <p>Loading contacts...</p>
          ) : contactsError ? (
            <p className="text-red-500">{contactsError}</p>
          ) : contacts.length > 0 ? (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className="contact mb-2 cursor-pointer"
                onClick={() => handleSendMessage(contact.phoneNumber)}
              >
                <strong>{contact.name}</strong> ({contact.phoneNumber})
              </div>
            ))
          ) : (
            <p>No contacts found.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Messages;
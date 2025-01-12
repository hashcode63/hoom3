'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import { useGetCallById } from '@/hooks/useGetCallById';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import Modal from '@/components/Modal';

const Table = ({ title, description }) => (
  <div className="flex flex-col items-start gap-2 xl:flex-row">
    <h1 className="text-base font-medium text-sky-1 lg:text-xl xl:min-w-32">{title}:</h1>
    <h1 className="truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl">{description}</h1>
  </div>
);

const PersonalRoom = () => {
  const router = useRouter();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const meetingId = user?.id;
  const { call } = useGetCallById(meetingId!);

  const startRoom = async () => {
    if (!client || !user) return;

    const newCall = client.call('default', meetingId!);

    if (!call) {
      await newCall.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
        },
      });
    }

    router.push(`/meeting/${meetingId}?personal=true`);
  };

  const handleJoinMeeting = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/validate-meeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingLink, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid meeting link or password');
      }

      // Redirect to the meeting page
      window.location.href = `/meeting/${meetingLink}?password=${password}`;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const meetingLinkUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`;

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-xl font-bold lg:text-3xl">Personal Meeting Room</h1>
      <div className="flex w-full flex-col gap-8 xl:max-w-[900px]">
        <Table title="Topic" description={`${user?.username}'s Meeting Room`} />
        <Table title="Meeting ID" description={meetingId!} />
        <Table title="Invite Link" description={meetingLinkUrl} />
      </div>
      <div className="flex gap-5">
        <Button className="bg-blue-1" onClick={startRoom}>
          Start Meeting
        </Button>
        <Button
          className="bg-dark-3"
          onClick={() => {
            navigator.clipboard.writeText(meetingLinkUrl);
            toast({
              title: 'Link Copied',
            });
          }}
        >
          Copy Invitation
        </Button>
        <Button className="bg-blue-1" onClick={() => setIsModalOpen(true)}>
          Join Meeting
        </Button>
      </div>
      <div className="mt-4">
        <Link href="/messages">
          <button className="px-4 py-2 bg-blue-1 text-white rounded">Go to Messages</button>
        </Link>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-bold mb-4">Join Meeting</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter meeting link"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 rounded"
          />
          <input
            type="password"
            placeholder="Enter meeting password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 rounded"
          />
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded">
              Cancel
            </Button>
            <Button onClick={handleJoinMeeting} className="px-4 py-2 bg-blue-1 text-white rounded" disabled={loading}>
              {loading ? 'Joining...' : 'Join Meeting'}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default PersonalRoom;
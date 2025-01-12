'use client';
import { useEffect, useState } from 'react';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import Alert from './Alert';
import { Button } from './ui/button';
import { Input } from './ui/input';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived = callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;
  const call = useCall();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  useEffect(() => {
    if (call && password) {
      const callPassword = call.state.custom?.password;
      if (callPassword && callPassword !== password) {
        setIsPasswordValid(false);
      } else {
        setIsPasswordValid(true);
      }
    }
  }, [call, password]);

  if (!call) {
    throw new Error('useStreamCall must be used within a StreamCall component.');
  }

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
        iconUrl="/icons/call-ended.svg"
      />
    );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
      <h1 className="text-center text-2xl font-bold">Setup</h1>
      <VideoPreview />
      <div className="flex h-16 items-center justify-center gap-3">
        <label className="flex items-center justify-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={isMicCamToggled}
            onChange={(e) => setIsMicCamToggled(e.target.checked)}
          />
          Join with mic and camera off
        </label>
        <DeviceSettings />
      </div>
      <Input
        type="password"
        placeholder="Enter meeting password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      {!isPasswordValid && (
        <p className="text-red-500">Invalid password. Please try again.</p>
      )}
      <Button
        className="rounded-md bg-green-500 px-4 py-2.5"
        onClick={() => {
          if (isPasswordValid) {
            call.join();
            setIsSetupComplete(true);
          }
        }}
      >
        Join meeting
      </Button>
    </div>
  );
};

export default MeetingSetup;
import { useEffect, useState } from 'react';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { ExtendedCall } from '@/types/ExtendedCall';

export const useGetCallById = (id: string) => {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<ExtendedCall | null>(null);
  const [isCallLoading, setIsCallLoading] = useState(true);

  useEffect(() => {
    const fetchCall = async () => {
      if (!client) return;
      try {
        const call = client.call('default', id) as ExtendedCall;
        await call.get();
        setCall(call);
      } catch (error) {
        console.error('Failed to fetch call:', error);
      } finally {
        setIsCallLoading(false);
      }
    };

    fetchCall();
  }, [client, id]);

  return { call, isCallLoading };
};

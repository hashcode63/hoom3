import { Call as StreamCall } from '@stream-io/video-react-sdk';

interface CustomData {
  custom: {
    password: string;
    description?: string;
  };
}

export interface ExtendedCall extends StreamCall {
  data: CustomData;
}
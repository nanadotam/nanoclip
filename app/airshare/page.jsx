import dynamic from 'next/dynamic';

const AirShare = dynamic(() => import('@/components/airshare/AirShare'), {
  ssr: false
});

export default function AirSharePage() {
  return <AirShare />;
} 
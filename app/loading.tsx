'use client'

import { ThreeDot } from 'react-loading-indicators';

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
    </div>
  );
}
import React from 'react';
import AIChatHistory from '@/components/Ref';

export default function Home() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome to Bold AI</h1>
      <AIChatHistory />
    </div>
  );
}
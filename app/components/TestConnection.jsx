"use client";

import { useState } from 'react';
import clipService from '@/lib/api/clipService';

export default function TestConnection() {
  const [status, setStatus] = useState('');

  const testConnection = async () => {
    try {
      const formData = new FormData();
      formData.append('url_slug', 'test-connection');
      formData.append('text_content', 'Testing API connection');
      
      const result = await clipService.createClip(formData);
      setStatus(`Connection successful! Clip created with slug: ${result.url_slug}`);
    } catch (error) {
      setStatus(`Connection failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4">
      <button 
        onClick={testConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test API Connection
      </button>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
} 
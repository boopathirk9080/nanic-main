// app/purchase/page.tsx
'use client';

import React, { useState } from 'react';
import PurchasesPage from './purchasess'; // Assuming corrected import path
import LocalTable from './localTable';

export default function PurchasePage() {
  const [activeTab, setActiveTab] = useState<'purchase' | 'local'>('purchase');

  return (
    <div className="p-4">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab('purchase')}
          className={`px-4 py-2 rounded ${activeTab === 'purchase' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Purchase
        </button>
        <button
          onClick={() => setActiveTab('local')}
          className={`px-4 py-2 rounded ${activeTab === 'local' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Local
        </button>
      </div>
      <div>
        {activeTab === 'purchase' && <PurchasesPage />}
        {activeTab === 'local' && <LocalTable />}
      </div>
    </div>
  );
}
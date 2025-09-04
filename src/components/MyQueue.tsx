import React, { useState } from 'react';

interface Order {
  id: string;
  client: string;
  property: string;
  borrower: string;
  sla: string;
  isRush: boolean;
  status: 'safe' | 'breach' | 'rush';
  orderType?: string;
}

const MyQueue: React.FC = () => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [hasActiveFile, setHasActiveFile] = useState(false);

  const availableOrders: Order[] = [
    {
      id: 'SW-2024-004',
      client: 'First National Bank',
      property: '123 Main St, Austin, TX',
      borrower: 'John Smith',
      sla: '2 days remaining',
      isRush: false,
      status: 'safe'
    },
    {
      id: 'SW-2024-005',
      client: 'Metro Credit Union',
      property: '456 Oak Ave, Dallas, TX',
      borrower: 'Jane Doe',
      sla: '6 hours remaining',
      isRush: true,
      status: 'rush'
    }
  ];

  const getNextFile = () => {
    if (availableOrders.length > 0) {
      setCurrentOrder(availableOrders[0]);
      setHasActiveFile(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rush': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'breach': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-blue-600 text-white p-4 rounded-lg mb-6">
        <h1 className="text-2xl font-bold mb-2">My Queue</h1>
        <p>Processor Dashboard - Ready to work on your next file</p>
      </div>

      <div className="text-center mb-8">
        <button
          onClick={getNextFile}
          disabled={hasActiveFile}
          className={`px-8 py-4 text-lg font-semibold rounded-lg transition-colors ${
            hasActiveFile
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {hasActiveFile ? 'File Already Assigned' : 'Get Next File'}
        </button>
      </div>

      {currentOrder && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Current Assignment</h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(currentOrder.status)}`}>
              {currentOrder.isRush ? 'RUSH' : currentOrder.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">File Number</p>
              <p className="font-semibold text-slate-800">{currentOrder.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Client</p>
              <p className="font-semibold text-slate-800">{currentOrder.client}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Property Address</p>
              <p className="font-semibold text-slate-800">{currentOrder.property}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Borrower</p>
              <p className="font-semibold text-slate-800">{currentOrder.borrower}</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">SLA:</span> {currentOrder.sla}
            </p>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
              Complete
            </button>
            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md">
              Hold
            </button>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">
              Reject
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-slate-800">Queue Status</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">
            {availableOrders.length} files available in queue
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyQueue;
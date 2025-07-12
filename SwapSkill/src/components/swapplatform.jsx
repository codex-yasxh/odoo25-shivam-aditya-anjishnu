import { useEffect, useState } from 'react';

const SwapPlatform = ({ userId }) => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/swaps/${userId}`)
      .then(res => res.json())
      .then(data => {
        setSwaps(data);
        setLoading(false);
      });
  }, [userId]);

  const handleStatusChange = (swapId, status) => {
    fetch(`/api/swaps/${swapId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to update swap status');
        }
        return res.json();
      })
      .then(updated => {
        setSwaps(prevSwaps =>
          prevSwaps.map(s => s._id === swapId ? { ...s, status: updated.status } : s)
        );
      })
      .catch(err => {
        // Optionally handle error, e.g., show a message
        console.error(err);
      });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h2 className="text-2xl mb-6">Swap Requests</h2>
      {swaps.length === 0 && <div>No swap requests yet.</div>}
      {swaps.map(swap => (
        <div key={swap._id} className="border-b border-gray-700 py-4 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <div>
              <b>{swap.requester?.name || 'Unknown'}</b> wants to swap <b>{swap.offeredSkill}</b> for <b>{swap.wantedSkill}</b>
            </div>
            <div className="text-sm text-gray-400">Message: {swap.message}</div>
            <div className="text-sm text-gray-400">Requested: {swap.createdAt ? new Date(swap.createdAt).toLocaleString() : ''}</div>
          </div>
          <div>
            <span className={`px-3 py-1 rounded ${swap.status === 'pending' ? 'bg-yellow-600' : swap.status === 'accepted' ? 'bg-green-600' : 'bg-red-600'}`}>
              {swap.status}
            </span>
            {swap.status === 'pending' && (
              <>
                <button className="ml-2 px-3 py-1 bg-green-700 rounded" onClick={() => handleStatusChange(swap._id, 'accepted')}>Accept</button>
                <button className="ml-2 px-3 py-1 bg-red-700 rounded" onClick={() => handleStatusChange(swap._id, 'rejected')}>Reject</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SwapPlatform;

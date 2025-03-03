import { useEffect, useState } from 'react';
import { API_URL } from '../config/api';

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/vote/getCandidates`)
      .then(res => res.json())
      .then(data => setCandidates(data));
  }, []);

  const closeVoting = async () => {
    await fetch(`${API_URL}/vote/closeVoting`, { method: 'POST' });
    alert('Voting closed!');
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={closeVoting}>Close Voting</button>
      <h2>Registered Candidates</h2>
      <ul>
        {candidates.map(candidate => (
          <li key={candidate.id}>{candidate.name}</li>
        ))}
      </ul>
    </div>
  );
};
export default AdminDashboard;
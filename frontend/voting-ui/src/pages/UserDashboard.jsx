import { useEffect, useState } from 'react';
import { API_URL } from '../config/api';

const UserDashboard = () => {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/vote/getCandidates`)
      .then(res => res.json())
      .then(data => setCandidates(data));
  }, []);

  return (
    <div>
      <h1>User Dashboard</h1>
      <h2>All Candidates</h2>
      <ul>
        {candidates.map(candidate => (
          <li key={candidate.id}>{candidate.name}</li>
        ))}
      </ul>
    </div>
  );
};
export default UserDashboard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Matches.css';
import { useNavigate } from 'react-router-dom';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get('http://44.205.169.11:8000/matches');
        setMatches(response.data.matches);
      } catch (error) {
        setError('Error fetching matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return <p>Loading matches...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="matches-container">
      <button className="back-button" onClick={() => navigate('/')}>Back</button>
      {matches.map((match, index) => (
        <div key={index} className="match">
          <div className={`player ${match.winner === match.player1 ? 'winner' : ''}`}>
            {match.player1}
          </div>
          <div className="vs">VS</div>
          <div className={`player ${match.winner === match.player2 ? 'winner' : ''}`}>
            {match.player2}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Matches;

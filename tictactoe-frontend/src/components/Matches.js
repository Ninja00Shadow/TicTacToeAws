import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import './Matches.css';

import { fetchMatches } from '../services/api';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [cookies] = useCookies(['username']);

  useEffect(() => {
    let isMounted = true;

    const loadMatches = async () => {
      try {
        const nextMatches = await fetchMatches(cookies.username);
        if (isMounted) {
          setMatches(nextMatches);
        }
      } catch (requestError) {
        if (isMounted) {
          setError('Could not load matches.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMatches();
    return () => {
      isMounted = false;
    };
  }, [cookies.username]);

  return (
    <main className="matches-view app-shell">
      <section className="matches-card">
        <button className="link-button" onClick={() => navigate('/')} type="button">Back</button>
        <h1>Match history</h1>
        {loading && <p className="muted">Loading matches...</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && matches.length === 0 && <p className="muted">No completed matches yet.</p>}
        <div className="matches-list">
          {matches.map((match, index) => (
            <article className="match" key={`${match.player1}-${match.player2}-${index}`}>
              <div className={`player ${match.winner === match.player1 ? 'winner' : ''}`}>{match.player1}</div>
              <div className="vs">VS</div>
              <div className={`player ${match.winner === match.player2 ? 'winner' : ''}`}>{match.player2}</div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Matches;

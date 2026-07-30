import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import './IndexView.css';

import { joinMatch } from '../services/api';
import userPool from '../userpool';
import { AUTH_MODE } from '../config';

const IndexView = () => {
  const navigate = useNavigate();
  const [cookies, , removeCookie] = useCookies(['user-token', 'username']);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const logout = () => {
    removeCookie('user-token', { path: '/' });
    removeCookie('username', { path: '/' });

    const cognitoUser = AUTH_MODE === 'cognito' ? userPool.getCurrentUser() : null;
    cognitoUser?.signOut();
    navigate('/login');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsJoining(true);

    try {
      const response = await joinMatch(cookies.username);
      navigate(`/game/${response.data.id}/${cookies.username}`);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not join a match.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <main className="home-view app-shell">
      <nav className="top-actions">
        <button onClick={() => navigate('/matches')} type="button">Matches</button>
        <button onClick={logout} type="button">Logout</button>
      </nav>

      <section className="hero-card">
        <p className="eyebrow">Tic Tac Toe</p>
        <h1>Ready for a quick match?</h1>
        <p className="muted">Join an open room or create a new one automatically.</p>
        <form onSubmit={handleSubmit}>
          <button disabled={isJoining} type="submit">
            {isJoining ? 'Joining...' : 'Play'}
          </button>
        </form>
        {error && <p className="form-error">{error}</p>}
      </section>
    </main>
  );
};

export default IndexView;

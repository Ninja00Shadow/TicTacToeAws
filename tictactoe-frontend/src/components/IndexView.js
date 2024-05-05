import React, { useState } from 'react';
import './IndexView.css';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import userPool from '../userpool';

const backendUrl = !!process.env.REACT_APP_BACKEND_URL ? 'http://${process.env.REACT_APP_API_IP}:8000' : 'http://localhost:8000';

const IndexView = () => {
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState('');

  const [cookies, setCookie, removeCookie] = useCookies(['user-token', 'username']);

  const logout = () => {
    removeCookie('user-token');
    removeCookie('username');

    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (playerName.trim() === '') {
      alert('Please enter a valid name.');
      return;
    }

    try {
      const response = await axios.post('', {
        'player-name': playerName
      });
      console.log(response);

      if (response.status === 200) {
        window.location.href = `/game/${response.data.id}/${playerName}`;
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChange = (e) => {
    setPlayerName(e.target.value);
  };

  return (
    <div className="wrapper">
      <button onClick={logout} className='logoutButton'>Logout</button>
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={playerName}
          onChange={handleChange}
          placeholder="Enter Your Name"
        />
        <button type="submit">Play</button>
      </form>
    </div>
  );
}

export default IndexView;
import React, { useState } from 'react';
import './IndexView.css';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import userPool from '../userpool';
import { useEffect } from "react";
import { useSaveRefreshTokenService, useRefreshTokenService } from '../services/refreshToken';

const IndexView = () => {
  const navigate = useNavigate();

  const [cookies, setCookie, removeCookie] = useCookies(['user-token', 'username']);

  // useEffect(() => {
  //   console.log("Access token = " + cookies['user-token']);
  //   console.log("Username = " + cookies['username']);
  //   console.log("Refresh token = " + cookies['refresh-token']);
  // }, []);

  // useSaveRefreshTokenService();

  // useRefreshTokenService(cookies['username'] || null);

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

    try {
      const response = await axios.post('', {
        'player-name': cookies['username'],
      });
      console.log(response);

      if (response.status === 200) {
        window.location.href = `/game/${response.data.id}/${cookies['username']}`;
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="wrapper">
      <button onClick={() => navigate('/matches')} className='matchesButton'>Matches</button>
      <button onClick={logout} className='logoutButton'>Logout</button>
      <form className="form" onSubmit={handleSubmit}>
        <button type="submit">Play</button>
      </form>
    </div>
  );
}

export default IndexView;
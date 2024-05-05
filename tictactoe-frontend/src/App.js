import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { CookiesProvider, useCookies } from 'react-cookie';
import IndexView from './components/IndexView';
import GameView from './components/GameView';
import Signup from './components/Signup';
import Login from './components/Login';

import { useRefreshTokenService } from './services/refreshToken';

import './App.css';

function App() {
  const [token] = useCookies(['user-token']);
  const [username] = useCookies(['username']);

  useEffect(() => {
    console.log("Access token = " + token['user-token']);
    console.log("Username = " + username['username']);
  }, []);

  useRefreshTokenService(username['username'] || null);

  return (
    <CookiesProvider>
      <Router>
        <Routes>
          <Route exact path="/" element={!!token['user-token'] ? <IndexView /> : <Navigate to="/login" replace />} />
          <Route path="/game/:roomID/:playerName" element={!!token['user-token'] ? <GameView /> : <Navigate to="/login" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </CookiesProvider>
  );
}

export default App;

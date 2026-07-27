import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { CookiesProvider, useCookies } from 'react-cookie';
import IndexView from './components/IndexView';
import GameView from './components/GameView';
import Signup from './components/Signup';
import Login from './components/Login';
import Matches from './components/Matches';

import { useRefreshTokenService, useSaveRefreshTokenService } from './services/refreshToken';

import './App.css';

function App() {
  const [cookies] = useCookies(['user-token', 'username', 'refresh-token']);

  return (
    <CookiesProvider>
      <Router>
        <Routes>
          <Route exact path="/" element={!!cookies['user-token'] ? <IndexView /> : <Navigate to="/login" replace />} />
          <Route path="/game/:roomID/:playerName" element={!!cookies['user-token'] ? <GameView /> : <Navigate to="/login" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path='/matches' element={<Matches />} />
        </Routes>
      </Router>
    </CookiesProvider>
  );
}

export default App;

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import IndexView from './components/IndexView';
import GameView from './components/GameView';
import Signup from './components/Signup';
import Login from './components/Login';

import './App.css';
import userpool from './userpool';

function App() {

  useEffect(() => {
    let user = userpool.getCurrentUser();
    if (!user) {
      <Navigate to="/login" />
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<IndexView />} />
        <Route path="/game/:roomID/:playerName" element={<GameView />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import IndexView from './components/IndexView';
import GameView from './components/GameView';

class App extends React.Component {
  render() {
    return (
      <Router>
        <Routes>
          <Route exact path="/" element={<IndexView />} />
          <Route path="/game/:roomID/:playerName" element={<GameView />} />
        </Routes>
      </Router>
    );
  }
}

export default App;

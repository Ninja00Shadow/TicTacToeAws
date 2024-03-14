import React, { useState } from 'react';
import './IndexView.css';

import axios from 'axios';
import { Redirect, redirect} from 'react-router-dom';

class IndexView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerName: '',
      roomID: null
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { playerName } = this.state;
    if (playerName.trim() === '') {
      alert('Please enter a valid name.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000', { 
        'player-name': playerName 
      });
      console.log(response);

      if (response.status === 200) {
        window.location.href = `/game/${response.data.id}/${playerName}`;
      }
      
    } catch (error) {
      console.error('Error:', error);
      // Tutaj możesz obsłużyć błąd, np. wyświetlając komunikat dla użytkownika
    }
  };

  handleChange = (e) => {
    this.setState({ playerName: e.target.value });
  };

  render() {
    const { playerName } = this.state;

    return (
      <div className="wrapper">
        <form className="form" onSubmit={this.handleSubmit}>
          <input
            type="text"
            value={playerName}
            onChange={this.handleChange}
            placeholder="Enter Your Name"
          />
          <button type="submit">Play</button>
        </form>
      </div>
    );
  }
}

export default IndexView;
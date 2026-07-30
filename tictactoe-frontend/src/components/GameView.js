import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './GameView.css';

import AvatarDisplay from './AvatarDisplay';
import { WS_URL } from '../config';

const emptyBoard = Array(9).fill('');

const GameView = () => {
  const { roomID, playerName } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const redirectTimeoutRef = useRef(null);
  const playerLetterRef = useRef('');

  const [board, setBoard] = useState(emptyBoard);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [playerLetter, setPlayerLetter] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [statusMessage, setStatusMessage] = useState('Waiting for opponent...');
  const [gameFinished, setGameFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const socket = new WebSocket(`${WS_URL}/ws/game/${roomID}/`);
    socketRef.current = socket;

    const redirectHome = () => {
      redirectTimeoutRef.current = window.setTimeout(() => navigate('/'), 2000);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === 'show_error') {
        setErrorMessage(data.error);
        setGameFinished(true);
        redirectHome();
        return;
      }

      if (data.event === 'game_start') {
        const letter = data.my_turn ? 'X' : 'O';
        playerLetterRef.current = letter;
        setBoard(Object.values(data.board));
        setIsMyTurn(data.my_turn);
        setPlayerLetter(letter);
        setOpponentName(data.players.find((player) => player !== playerName) || '');
        setStatusMessage(data.my_turn ? 'Your turn' : "Opponent's turn");
        return;
      }

      if (data.event === 'boardData_send') {
        setBoard(Object.values(data.board));
        setIsMyTurn(data.my_turn);
        setStatusMessage(data.my_turn ? 'Your turn' : "Opponent's turn");
        return;
      }

      if (data.event === 'won') {
        setBoard(Object.values(data.board));
        setIsMyTurn(false);
        setGameFinished(true);
        setStatusMessage(data.winner === playerLetterRef.current ? 'You won' : 'You lost');
        redirectHome();
        return;
      }

      if (data.event === 'draw') {
        setBoard(Object.values(data.board));
        setIsMyTurn(false);
        setGameFinished(true);
        setStatusMessage('Draw');
        redirectHome();
        return;
      }

      if (data.event === 'opponent_left') {
        setIsMyTurn(false);
        setGameFinished(true);
        setStatusMessage('Opponent left');
        redirectHome();
      }
    };

    socket.onerror = () => {
      setErrorMessage('Connection to the game server failed.');
      setGameFinished(true);
    };

    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
      socket.close();
    };
  }, [navigate, playerName, roomID]);

  const handleCellClick = (index) => {
    if (!isMyTurn || gameFinished || board[index] || !playerLetter) {
      return;
    }

    const nextBoard = [...board];
    nextBoard[index] = playerLetter;
    setBoard(nextBoard);
    setIsMyTurn(false);
    setStatusMessage("Opponent's turn");

    socketRef.current?.send(JSON.stringify({
      event: 'boardData_send',
      board: Object.fromEntries(nextBoard.map((cell, cellIndex) => [cellIndex, cell])),
      player: playerName,
    }));
  };

  return (
    <main className="game-view app-shell">
      <aside className="player-card">
        <AvatarDisplay username={playerName} />
        <span>{playerName}</span>
        <strong>You {playerLetter && `(${playerLetter})`}</strong>
      </aside>

      <section className="game-panel">
        <p className={`game-status ${errorMessage ? 'game-status--error' : ''}`}>
          {errorMessage || statusMessage}
        </p>
        <div className="board" aria-label="Tic tac toe board">
          {board.map((cell, index) => (
            <button
              aria-label={`Cell ${index + 1}`}
              className="box"
              disabled={!isMyTurn || gameFinished || Boolean(cell)}
              key={index}
              onClick={() => handleCellClick(index)}
              type="button"
            >
              {cell && <span className="player-letter active">{cell}</span>}
            </button>
          ))}
        </div>
      </section>

      <aside className="player-card">
        {opponentName && <AvatarDisplay username={opponentName} />}
        <span>{opponentName || 'Waiting...'}</span>
        <strong>Opponent</strong>
      </aside>
    </main>
  );
};

export default GameView;

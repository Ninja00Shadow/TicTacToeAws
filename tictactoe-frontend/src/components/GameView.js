import React, { useState, useEffect } from 'react';
import './GameView.css';

import axios from 'axios';
import { useParams } from 'react-router-dom';


// const GameView = ({ roomID, playerName }) => {
  const GameView = () => {
    const { roomID, playerName } = useParams();
    console.log(roomID, playerName)
    const ws_url = `ws://localhost:8000/ws/game/${roomID}/`
    const ws = new WebSocket(`ws://localhost:8000/ws/game/${roomID}/`);

  useEffect(() => {

    let board = {
      0: '', 1: '', 2: '',
      3: '', 4: '', 5: '',
      6: '', 7: '', 8: '',
    }
    let myTurn = false
    let playerLetter = ""
    const turnElm = document.getElementById("turn")
    const opponentTxt = document.getElementById("opponent-txt")

    const boxes = document.getElementsByClassName("box")
    Array.from(boxes).forEach((elm, i) => {
      elm.addEventListener("click", e => {
        board[i] = playerLetter
        if (myTurn && !elm.innerHTML && !elm.getAttribute("player")) {
          ws.send(JSON.stringify({
            event: "boardData_send",
            board: board,
          }))
          addPlayerLetter(elm)
          myTurn = false
        }
      })
    })

    function addPlayerLetter(element, player = playerLetter) {
      element.innerHTML = `<p class="player-letter" >${player}</p>`
      element.setAttribute("player", player)
      setTimeout(() => {
        element.children[0].classList.add("active")
      }, 1);
    }

    function resetBoard() {
      Array.from(boxes).forEach(elm => {
        elm.innerHTML = ''
        elm.setAttribute("player", "")
      })
    }

    function updateBoard(boardData) {
      Array.from(boxes).forEach((elm, i) => {
        if (boardData[i] !== '' && !elm.getAttribute("player")) {
          addPlayerLetter(elm, boardData[i])
        }
      })
    }

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = e => {
      console.log(e)
      const data = JSON.parse(e.data)
      if (data.event === "show_error") {
        alert(data.error)
        window.location.href = "/"
      }
      else if (data.event === "game_start") {
        board = data.board
        myTurn = data.my_turn
        playerLetter = data.my_turn ? "X" : "O"
        resetBoard()
        turnElm.innerHTML = myTurn ? "Your Turn" : "Opponent's Turn"
        opponentTxt.innerHTML = data.players[0] === "{{name}}" ? data.players[1] : data.players[0]
      }
      else if (data.event === "boardData_send") {
        board = data.board
        myTurn = data.my_turn
        updateBoard(board)
        turnElm.innerHTML = myTurn ? "Your Turn" : "Opponent's Turn"
      }
      else if (data.event === "won") {
        board = data.board
        myTurn = data.my_turn
        updateBoard(board)
        turnElm.innerHTML = data.winner === playerLetter ? "You Won" : "You Lost"
        setTimeout(() => {
          alert(data.winner === playerLetter ? "You Won" : "You Lost")
          window.location.href = "/"
        }, 2000);
      }

      else if (data.event === "draw") {
        board = data.board
        myTurn = data.my_turn
        updateBoard(board)
        turnElm.innerHTML = "Draw"
        setTimeout(() => {
          alert("Draw")
          window.location.href = "/"
        }, 2000);
      }

      else if (data.event === "opponent_left") {
        alert("Opponent Left")
        window.location.href = "/"
      }
    }

    // return () => {
    //   ws.close();
    // };
  }, []);

  return (
    <div className="wrapper">
      <div className="details">
        <p>{playerName} (You)</p>
        <p id="opponent-txt">Opponent (waiting to join)</p>
      </div>
      <div class="container">
        <div boxIndex="0" player="" class="box child box-1 b-right b-bottom"></div>
        <div boxIndex="1" player="" class="box child box-2 b-left b-right b-bottom" ></div>
        <div boxIndex="2" player="" class="box child box-3 b-left b-bottom" ></div>
        <div boxIndex="3" player="" class="box child box-4 b-top b-right b-bottom" ></div>
        <div boxIndex="4" player="" class="box child box-5 b-top b-bottom b-right b-left" ></div>
        <div boxIndex="5" player="" class="box child box-6 b-top b-bottom b-left" ></div>
        <div boxIndex="6" player="" class="box child box-7 b-right b-top" ></div>
        <div boxIndex="7" player="" class="box child box-8 b-top b-right b-left" ></div>
        <div boxIndex="8" player="" class="box child box-9 b-top b-left" ></div>
      </div>
      <div className="details">
        <p id="turn"></p>
      </div>
    </div>
  );
};

export default GameView;

const express = require('express')
const http = require('http')
const path = require('path')
const WebSocket = require('ws');
const Board = require ('./Board');

const app = express()
const port = 12075;

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });
// TODO: ping/pong as https://github.com/websockets/ws#how-to-detect-and-close-broken-connections

// TODO
function Player() {
  let name = "";
  let sock = null;
}

function makeid() {
  // TODO: determine appropriate length
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    if (i < 2)
      text += "-";
  }

  return text; // TODO: check for collisions
}

// TODO: make proper class?
class Game {
  constructor() {
    this.players = [];
    this.id = makeid();
    this.turn = null;
    this.board = new Board();
  }
  
  getOtherPlayer(player) {
    if (this.players.length !== 2) {
      console.log('length is not 2');
    }
    //if (this.players.length === 2) {
      if (this.players[0] === player)
        return this.players[1];
      else
        return this.players[0];
    //} else {
      return null;
    //}
  }
}

let games = [];

function sendState(ws) {
  let res = {};
  res.response = "state";
  res.state = ws.game.board.state;
  res.last_move = ws.game.board.moves[ws.game.board.moves.length - 1];
  res.your_turn = (ws.game.turn === ws);
  ws.send(JSON.stringify(res));
}

function sendError(ws, str, code="error") {
  console.log("ERROR: " + str);
  let res = {};
  res.response = code;
  res.error = str;
  ws.send(JSON.stringify(res));
}

wss.on('connection', function connection(ws, req) {
  console.log(`Client ${req.connection.remoteAddress} connected!`);
  ws.on('message', function incoming(message) {
    console.log(message);
    let data = JSON.parse(message);
    switch (data.cmd) {
      case "new_game":
        let game = new Game();
        if (Math.random() > 0.5)
          game.turn = ws;
        ws.game = game;
        ws.token = "x";
        game.players.push(ws);
        games.push(game);
        ws.send(`{"response": "game_code", "game_code": "${game.id}"}`);
        sendState(ws);
        break;

      case "join_game":
        // find game
        for (const game of games) {
          ws.token = "o";
          if (game.id == data.game_code && game.players.length == 1) { // can be joined
            if (game.turn == null)
              game.turn = ws;
            game.players.push(ws);
            ws.game = game;
            break; // from for..in
          }
        }
        // verify game was joined
        if (ws.game == null) {
          sendError(ws, "Game could not be joined. Check your game code?");
          break;
        }
        sendState(ws);
        break;

      case "get_state":
        sendState(ws);
        break;

      case "move":
        let valid = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        let subboard = parseInt(data.location[0]);
        let spot = parseInt(data.location[2]);
        if (!valid.includes(subboard) || !valid.includes(spot)) {
          sendError(ws, "Move not valid. Please try again.");
          break;
        } else if (ws.game.turn != ws) {
          sendError(ws, "It's not your turn!");
        } else {
          try {
            ws.game.board.move(subboard, spot, ws.token);
          } catch (e) {
            sendError(ws, e);
          }
        }

        if (ws.game.board.winner !== null) { // TODO
          let res = {};
          res.response = "";
          res.error = str;
          ws.send(JSON.stringify(res));
        }
        // pass turn to other player
        ws.game.turn = ws.game.getOtherPlayer(ws);
        sendState(ws.game.getOtherPlayer(ws));
        sendState(ws);

        console.log(ws.game.board.state);
        break;
      default:
        console.log("Unknown Response: " + data.response);
    }
  });

});

app.use('/static', express.static(path.join(__dirname, 'static')))
app.get('/', (req, res) => res.sendFile('index.html', {root: __dirname}))

app.listen(port, () => console.log(`Listening on port ${port}!`))

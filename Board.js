// This file is a javascript port of https://github.com/smit8397/super-tic-tac-toe/blob/master/game.py
// It functions fundamentally the same, but has some extra error checking and other functionality built in.
// It is intended to conform to the description at https://en.wikipedia.org/wiki/Ultimate_tic-tac-toe

let winning_combos = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

String.prototype.replaceAt=function(index, replacement) {
    let s = this.substring(0, index);
    s += replacement;
    s += this.substring(index + replacement.length);
    return s;
}

class SubBoard {
    constructor() {
        this.state = " ".repeat(9);
        this.winner = null;
    }

    move(spot, token) {
        if (this.winner !== null)
            throw 'Grid is already won';
        if (this.state[spot] !== ' ')
            throw 'Space is already taken';
        this.state = this.state.replaceAt(spot, token);
        this.checkForWinner();
    }

    checkForWinner() {
        for (let wc of winning_combos) {
            if (this.state[wc[0]] != " " && 
                this.state[wc[0]] == this.state[wc[1]] &&
                this.state[wc[0]] == this.state[wc[2]]) {
                    this.winner = this.state[wc[0]];
            }
        }
    }

    get isFull() {
        return this.state.indexOf(' ') < 0;
    }
}

module.exports = class Board {
    constructor() {
        this.subboards = [];
        this.moves = []; // TODO
        this.winner = null;
        for (let i = 0; i < 9; i++)
            this.subboards.push(new SubBoard);
    }

    get state() {
        let s = "";
        for (let subboard of this.subboards)
            s += subboard.state;
        return s;
    }

    checkForWinner() {
        for (let wc of winning_combos) {
            let w0 = this.subboards[wc[0]].winner;
            let w1 = this.subboards[wc[1]].winner;
            let w2 = this.subboards[wc[2]].winner;
            if (w0 != null && w0 == w1 && w1 == w2)
                this.winner = w0;
        }
    }

    move(subboard, spot, token) {
        if (token != "x" && token != "o") // TODO: better tokens?
            throw `Invalid token "${token}"`;
        if (this.moves.length > 0) {
            let dest_board = this.moves[this.moves.length - 1][1];
            if (subboard != dest_board && // not the same as previous
                this.subboards[dest_board].winner === null &&
                !this.subboards[dest_board].isFull)
                throw `Invalid subboard. You should be moving in subboard ${this.moves[this.moves.length - 1][1]}`;
        }
        this.subboards[subboard].move(spot, token);
        this.moves.push([subboard, spot]);
        this.checkForWinner();
    }

    get subBoardWinners() {
        return this.subboards.map(subboard => subboard.winner);
    }
}
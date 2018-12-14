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
            throw "Error: Grid is already won";
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

    getState() {
        return this.state;
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
            s += subboard.getState();
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
        if (token != "x" && token != "o")
            throw `Error: invalid token "${token}"`;
        this.subboards[subboard].move(spot, token);
        this.moves.push([subboard, spot]);
        this.checkForWinner();
    }

    get subBoardWinners() {
        return this.subboards.map(subboard => subboard.winner);
    }
}
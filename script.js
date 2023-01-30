class piece {
    constructor(name, x, y, colour) {
        this.n = name;
        this.x = x;
        this.y = y;
        this.c = colour;
        this.hasMoved = false;
        this.moveCount = 0;
        this.lastTurn = -1;
    }
    display(ctx) {
        // ctx.drawImg(this.img, x*100,y*100, 100,100);
        ctx.fillStyle = this.c;
        ctx.font = "40px Arial"
        ctx.textAlign = "center";
        ctx.fillText(this.n, this.x * 100 + 50, this.y * 100 + 62);
        //console.log(ctx, ctx.fillStyle, this.n);
    }
}

const $ = (id) => document.getElementById(id);
const ctx = $("board").getContext("2d");
let turn = 0;
let board = [
    [new piece("R", 0, 0, "black"), new piece("Kn", 1, 0, "black"), new piece("B", 2, 0, "black"), new piece("Q", 3, 0, "black"), new piece("K", 4, 0, "black"), new piece("B", 5, 0, "black"), new piece("Kn", 6, 0, "black"), new piece("R", 7, 0, "black")],
    [new piece("P", 0, 1, "black"), new piece("P", 1, 1, "black"), new piece("P", 2, 1, "black"), new piece("P", 3, 1, "black"), new piece("P", 4, 1, "black"), new piece("P", 5, 1, "black"), new piece("P", 6, 1, "black"), new piece("P", 7, 1, "black")],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [new piece("P", 0, 6, "white"), new piece("P", 1, 6, "white"), new piece("P", 2, 6, "white"), new piece("P", 3, 6, "white"), new piece("P", 4, 6, "white"), new piece("P", 5, 6, "white"), new piece("P", 6, 6, "white"), new piece("P", 7, 6, "white")],
    [new piece("R", 0, 7, "white"), new piece("Kn", 1, 7, "white"), new piece("B", 2, 7, "white"), new piece("Q", 3, 7, "white"), new piece("K", 4, 7, "white"), new piece("B", 5, 7, "white"), new piece("Kn", 6, 7, "white"), new piece("R", 7, 7, "white")]
];
let selected = [-1, -1];
let moves = [];

let enPassant = false;
let castling = false;

function displayGrid() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            ctx.fillStyle = ((i + j) % 2 == 1) ? "#804112" : "grey";
            ctx.fillRect(i * 100, j * 100, 100, 100);
        }
    }
}

function displayPieces() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] != 0) {
                board[i][j].display(ctx);
            }
        }
    }
}

function updateSelected() {
    displayGrid();
    displayPieces();
    ctx.fillStyle = "rgba(200,200,200,0.5)";
    ctx.fillRect(selected[0] * 100, selected[1] * 100, 100, 100);
    if (board[selected[1]][selected[0]] != 0) {
        board[selected[1]][selected[0]].display(ctx);
        displayMoves();
    }
}

function displayMoves() {
    moves = [];
    enPassant = false;
    castling = false;
    if ((turn % 2 == 0 && board[selected[1]][selected[0]].c == "white") || (turn % 2 == 1 && board[selected[1]][selected[0]].c == "black")) {
        moves = getMoves();
        moves = checkInvalid(moves);
        for (let i = 0; i < moves.length; i++) {
            if (board[moves[i][0]][moves[i][1]] == 0) {
                ctx.beginPath();
                ctx.arc(moves[i][1] * 100 + 50, moves[i][0] * 100 + 50, 10, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = "rgba(255,255,255,0.6)"
                ctx.fill();
            } else {
                ctx.fillStyle = "rgba(255,0,0,0.4)";
                ctx.fillRect(moves[i][1] * 100, moves[i][0] * 100, 100, 100);
            }
        }
    }
}

function getMoves() {
    let moves = [];
    switch (board[selected[1]][selected[0]].n) {
        case "P":
            moves = pawn();
            break;
        case "B":
            moves = bishop();
            break;
        case "R":
            moves = rook();
            break;
        case "Q":
            moves = queen();
            break;
        case "Kn":
            moves = knight();
            break;
        case "K":
            moves = king();
            break;
    }
    return moves;
}

function pawn() {
    let mult = 1 + (-2 * ((turn + 1) % 2));
    let moves = [];
    if (board[selected[1] + mult][selected[0]] == 0) {
        moves.push([selected[1] + mult, selected[0]]);
    }
    if (board[selected[1]][selected[0]].hasMoved == false && board[selected[1] + (2 * mult)][selected[0]] == 0 && moves.length > 0) {
        moves.push([selected[1] + (2 * mult), selected[0]]);
    }
    if (selected[1] + mult >= 0 && selected[1] + mult < 8 && selected[0] + 1 < 8 && board[selected[1] + mult][selected[0] + 1] != 0 && board[selected[1] + mult][selected[0] + 1].c != board[selected[1]][selected[0]].c) {
        moves.push([selected[1] + mult, selected[0] + 1]);
    }
    if (selected[1] + mult >= 0 && selected[1] + mult < 8 && selected[0] - 1 >= 0 && board[selected[1] + mult][selected[0] - 1] != 0 && board[selected[1] + mult][selected[0] - 1].c != board[selected[1]][selected[0]].c) {
        moves.push([selected[1] + mult, selected[0] - 1]);
    }
    //  console.log(board[selected[1]][selected[0] + 1].moveCount);
    if (selected[0] + 1 < 8 && board[selected[1]][selected[0] + 1].n == "P" && board[selected[1]][selected[0] + 1].moveCount == 1 && (board[selected[1]][selected[0] + 1].y == 3 || board[selected[1]][selected[0] + 1].y == 4) && board[selected[1]][selected[0] + 1].c != board[selected[1]][selected[0]].c && board[selected[1]][selected[0] + 1].lastTurn == turn - 1) {
        moves.push([selected[1] + mult, selected[0] + 1]);
        enPassant = true;
    }
    if (selected[0] - 1 >= 0 && board[selected[1]][selected[0] - 1].n == "P" && board[selected[1]][selected[0] - 1].moveCount == 1 && (board[selected[1]][selected[0] - 1].y == 3 || board[selected[1]][selected[0] - 1].y == 4) && board[selected[1]][selected[0] - 1].c != board[selected[1]][selected[0]].c && board[selected[1]][selected[0] - 1].lastTurn == turn - 1) {
        moves.push([selected[1] + mult, selected[0] - 1]);
        enPassant = true;
    }
    return moves;
}

function bishop() {
    let moves = [];
    let finished = [false, false, false, false];
    let sC = board[selected[1]][selected[0]].c;
    for (let i = 1; i < 8; i++) {
        if (!finished[0] && selected[1] + i < 8 && selected[0] + i < 8) {
            if (board[selected[1] + i][selected[0] + i] == 0) {
                moves.push([selected[1] + i, selected[0] + i]);
            } else if (board[selected[1] + i][selected[0] + i].c != sC) {
                moves.push([selected[1] + i, selected[0] + i]);
                finished[0] = true;
            } else {
                finished[0] = true;
            }
        }
        if (!finished[1] && selected[1] + i < 8 && selected[0] - i >= 0) {
            if (board[selected[1] + i][selected[0] - i] == 0) {
                moves.push([selected[1] + i, selected[0] - i]);
            } else if (board[selected[1] + i][selected[0] - i].c != sC) {
                moves.push([selected[1] + i, selected[0] - i]);
                finished[1] = true;
            } else {
                finished[1] = true;
            }
        }
        if (!finished[2] && selected[1] - i >= 0 && selected[0] + i < 8) {
            if (board[selected[1] - i][selected[0] + i] == 0) {
                moves.push([selected[1] - i, selected[0] + i]);
            } else if (board[selected[1] - i][selected[0] + i].c != sC) {
                moves.push([selected[1] - i, selected[0] + i]);
                finished[2] = true;
            } else {
                finished[2] = true;
            }
        }
        if (!finished[3] && selected[1] - i >= 0 && selected[0] - i >= 0) {
            if (board[selected[1] - i][selected[0] - i] == 0) {
                moves.push([selected[1] - i, selected[0] - i]);
            } else if (board[selected[1] - i][selected[0] - i].c != sC) {
                moves.push([selected[1] - i, selected[0] - i]);
                finished[3] = true;
            } else {
                finished[3] = true;
            }
        }
    }
    return moves;
}

function rook() {
    let moves = [];
    let finished = [false, false, false, false];
    let sC = board[selected[1]][selected[0]].c;
    for (let i = 1; i < 8; i++) {
        if (!finished[0] && selected[1] + i < 8) {
            if (board[selected[1] + i][selected[0]] == 0) {
                moves.push([selected[1] + i, selected[0]]);
            } else if (board[selected[1] + i][selected[0]].c != sC) {
                moves.push([selected[1] + i, selected[0]]);
                finished[0] = true;
            } else {
                finished[0] = true;
            }
        }
        if (!finished[1] && selected[0] - i >= 0) {
            if (board[selected[1]][selected[0] - i] == 0) {
                moves.push([selected[1], selected[0] - i]);
            } else if (board[selected[1]][selected[0] - i].c != sC) {
                moves.push([selected[1], selected[0] - i]);
                finished[1] = true;
            } else {
                finished[1] = true;
            }
        }
        if (!finished[2] && selected[0] + i < 8) {
            if (board[selected[1]][selected[0] + i] == 0) {
                moves.push([selected[1], selected[0] + i]);
            } else if (board[selected[1]][selected[0] + i].c != sC) {
                moves.push([selected[1], selected[0] + i]);
                finished[2] = true;
            } else {
                finished[2] = true;
            }
        }
        if (!finished[3] && selected[1] - i >= 0) {
            if (board[selected[1] - i][selected[0]] == 0) {
                moves.push([selected[1] - i, selected[0]]);
            } else if (board[selected[1] - i][selected[0]].c != sC) {
                moves.push([selected[1] - i, selected[0]]);
                finished[3] = true;
            } else {
                finished[3] = true;
            }
        }
    }
    return moves;
}

function queen() {
    let moves = bishop();
    let moves2 = rook();
    let movesOut = new Array(moves.length + moves2.length);
    for (let i = 0; i < movesOut.length; i++) {
        if (i < moves.length) {
            movesOut[i] = moves[i];
        } else {
            movesOut[i] = moves2[i - moves.length];
        }
    }
    return movesOut;
}

function knight() {
    let moves = [];
    let sC = board[selected[1]][selected[0]].c;
    const valid = (i, j) => (i < 8 && i > -1 && j < 8 && j > -1 && (board[i][j] == 0 || board[i][j].c != sC)) ? true : false;
    if (valid(selected[1] + 2, selected[0] + 1)) moves.push([selected[1] + 2, selected[0] + 1]);
    if (valid(selected[1] - 2, selected[0] + 1)) moves.push([selected[1] - 2, selected[0] + 1]);
    if (valid(selected[1] + 2, selected[0] - 1)) moves.push([selected[1] + 2, selected[0] - 1]);
    if (valid(selected[1] - 2, selected[0] - 1)) moves.push([selected[1] - 2, selected[0] - 1]);
    if (valid(selected[1] + 1, selected[0] + 2)) moves.push([selected[1] + 1, selected[0] + 2]);
    if (valid(selected[1] + 1, selected[0] - 2)) moves.push([selected[1] + 1, selected[0] - 2]);
    if (valid(selected[1] - 1, selected[0] + 2)) moves.push([selected[1] - 1, selected[0] + 2]);
    if (valid(selected[1] - 1, selected[0] - 2)) moves.push([selected[1] - 1, selected[0] - 2]);
    return moves;
}

function king() {
    let moves = [];
    let sC = board[selected[1]][selected[0]].c;
    const valid = (i, j) => (i < 8 && i > -1 && j < 8 && j > -1 && (board[i][j] == 0 || board[i][j].c != sC)) ? true : false;
    if (valid(selected[1] + 1, selected[0] + 1)) moves.push([selected[1] + 1, selected[0] + 1]);
    if (valid(selected[1] + 1, selected[0])) moves.push([selected[1] + 1, selected[0]]);
    if (valid(selected[1] + 1, selected[0] - 1)) moves.push([selected[1] + 1, selected[0] - 1]);
    if (valid(selected[1], selected[0] - 1)) moves.push([selected[1], selected[0] - 1]);
    if (valid(selected[1], selected[0] + 1)) moves.push([selected[1], selected[0] + 1]);
    if (valid(selected[1] - 1, selected[0] + 1)) moves.push([selected[1] - 1, selected[0] + 1]);
    if (valid(selected[1] - 1, selected[0])) moves.push([selected[1] - 1, selected[0]]);
    if (valid(selected[1] - 1, selected[0] - 1)) moves.push([selected[1] - 1, selected[0] - 1]);
    if (board[selected[1]][selected[0]].hasMoved == false) {
        if (board[selected[1]][0].hasMoved == false && board[selected[1]][1] == 0 && board[selected[1]][2] == 0 && board[selected[1]][3] == 0) {
            moves.push([selected[1], 2]);
            castling = true;
        }
        if (board[selected[1]][7].hasMoved == false && board[selected[1]][5] == 0 && board[selected[1]][6] == 0) {
            moves.push([selected[1], 6]);
            castling = true;
        }

    }
    return moves;
}

function checkInvalid(moves) {
    console.log(check((turn % 2 == 0) ? "white" : "black"));
    return moves;
}

function check(colour) {
    let kingX = 0;
    let kingY = 0;
    let out = false;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].n == "K" && board[i][j].c == colour) {
                kingX = i;
                kingY = j;
            }
        }
    }
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] != 0 && board[i][j].c != colour) {
                const store = selected;
                selected = [j, i];
                turn++;
                let cMoves = getMoves();
                turn--;
                for (let k = 0; k < cMoves.length; k++) {
                    if (cMoves[k][1] == kingY && cMoves[k][0] == kingX) {
                        out = true;
                        console.log(selected);
                        console.log(cMoves);
                        console.log(cMoves[k], kingX, kingY);
                    }
                }
                selected = store;
            }
        }
    }
    return out;
}

displayGrid();
displayPieces();
//ctx.fillText("R", 0, 0);

document.addEventListener("click", (e) => {
    if (e.target.id == "board") {
        let boardClientPos = $("board").getBoundingClientRect();
        if (selected[0] + selected[1] < 0) {
            selected = [Math.floor((e.clientX - boardClientPos.x) / 100), Math.floor((e.clientY - boardClientPos.y) / 100)];
            updateSelected();
        } else {
            let input = [Math.floor((e.clientX - boardClientPos.x) / 100), Math.floor((e.clientY - boardClientPos.y) / 100)];
            for (let i = 0; i < moves.length; i++) {
                if (input[1] == moves[i][0] && input[0] == moves[i][1]) {
                    if (enPassant && moves[i][1] - selected[i][0] != 0 && board[moves[i][0]][moves[i][1]] == 0) {
                        board[selected[1]][moves[i][1]] = 0;
                    }
                    if (castling && Math.abs(selected[0] - moves[i][1]) > 1) {
                        if (moves[i][1] == 2) {
                            board[selected[1]][3] = board[selected[1]][0];
                            board[selected[1]][0] = 0;
                            board[selected[1]][3].hasMoved = true;
                            board[selected[1]][3].moveCount++;
                            board[selected[1]][3].x = 3;
                        } else {
                            board[selected[1]][5] = board[selected[1]][7];
                            board[selected[1]][7] = 0;
                            board[selected[1]][5].hasMoved = true;
                            board[selected[1]][5].moveCount++;
                            board[selected[1]][5].x = 5;
                        }
                    }
                    board[moves[i][0]][moves[i][1]] = board[selected[1]][selected[0]];
                    board[selected[1]][selected[0]] = 0;
                    board[moves[i][0]][moves[i][1]].hasMoved = true;
                    board[moves[i][0]][moves[i][1]].moveCount++;
                    board[moves[i][0]][moves[i][1]].lastTurn = turn;
                    board[moves[i][0]][moves[i][1]].x = moves[i][1];
                    board[moves[i][0]][moves[i][1]].y = moves[i][0];
                    turn++;
                    break;
                }
            }
            selected = [-1, -1];
            displayGrid();
            displayPieces();
        }
    }
});

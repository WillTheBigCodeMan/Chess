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

function displayGrid(b) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            ctx.fillStyle = ((i + j) % 2 == 1) ? "#804112" : "grey";
            ctx.fillRect(i * 100, j * 100, 100, 100);
        }
    }
}

function displayPieces(b) {
    for (let i = 0; i < b.length; i++) {
        for (let j = 0; j < b[i].length; j++) {
            if (b[i][j] != 0) {
                b[i][j].display(ctx);
            }
        }
    }
}

function updateSelected(b) {
    displayGrid(b);
    displayPieces(b);
    ctx.fillStyle = "rgba(200,200,200,0.5)";
    ctx.fillRect(selected[0] * 100, selected[1] * 100, 100, 100);
    if (b[selected[1]][selected[0]] != 0) {
        b[selected[1]][selected[0]].display(ctx);
        displayMoves(b);
    }
}

function displayMoves(b) {
    moves = [];
    enPassant = false;
    castling = false;
    if ((turn % 2 == 0 && b[selected[1]][selected[0]].c == "white") || (turn % 2 == 1 && b[selected[1]][selected[0]].c == "black")) {
        moves = getMoves(b);
        moves = checkInvalid(moves,b);
        for (let i = 0; i < moves.length; i++) {
            if (b[moves[i][0]][moves[i][1]] == 0) {
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

function getMoves(b) {
    let moves = [];
    switch (b[selected[1]][selected[0]].n) {
        case "P":
            moves = pawn(b);
            break;
        case "B":
            moves = bishop(b);
            break;
        case "R":
            moves = rook(b);
            break;
        case "Q":
            moves = queen(b);
            break;
        case "Kn":
            moves = knight(b);
            break;
        case "K":
            moves = king(b);
            break;
    }
    return moves;
}

function pawn(b) {
    let mult = 1 + (-2 * ((turn + 1) % 2));
    let moves = [];
    if (b[selected[1] + mult][selected[0]] == 0) {
        moves.push([selected[1] + mult, selected[0]]);
    }
    if (b[selected[1]][selected[0]].hasMoved == false && b[selected[1] + (2 * mult)][selected[0]] == 0 && moves.length > 0) {
        moves.push([selected[1] + (2 * mult), selected[0]]);
    }
    if (selected[1] + mult >= 0 && selected[1] + mult < 8 && selected[0] + 1 < 8 && b[selected[1] + mult][selected[0] + 1] != 0 && b[selected[1] + mult][selected[0] + 1].c != b[selected[1]][selected[0]].c) {
        moves.push([selected[1] + mult, selected[0] + 1]);
    }
    if (selected[1] + mult >= 0 && selected[1] + mult < 8 && selected[0] - 1 >= 0 && b[selected[1] + mult][selected[0] - 1] != 0 && b[selected[1] + mult][selected[0] - 1].c != b[selected[1]][selected[0]].c) {
        moves.push([selected[1] + mult, selected[0] - 1]);
    }
    if (selected[0] + 1 < 8 && b[selected[1]][selected[0] + 1].n == "P" && b[selected[1]][selected[0] + 1].moveCount == 1 && (b[selected[1]][selected[0] + 1].y == 3 || b[selected[1]][selected[0] + 1].y == 4) && b[selected[1]][selected[0] + 1].c != b[selected[1]][selected[0]].c && b[selected[1]][selected[0] + 1].lastTurn == turn - 1) {
        moves.push([selected[1] + mult, selected[0] + 1]);
        enPassant = true;
    }
    if (selected[0] - 1 >= 0 && b[selected[1]][selected[0] - 1].n == "P" && b[selected[1]][selected[0] - 1].moveCount == 1 && (b[selected[1]][selected[0] - 1].y == 3 || b[selected[1]][selected[0] - 1].y == 4) && b[selected[1]][selected[0] - 1].c != b[selected[1]][selected[0]].c && b[selected[1]][selected[0] - 1].lastTurn == turn - 1) {
        moves.push([selected[1] + mult, selected[0] - 1]);
        enPassant = true;
    }
    return moves;
}

function bishop(b) {
    let moves = [];
    let finished = [false, false, false, false];
    let sC = b[selected[1]][selected[0]].c;
    for (let i = 1; i < 8; i++) {
        if (!finished[0] && selected[1] + i < 8 && selected[0] + i < 8) {
            if (b[selected[1] + i][selected[0] + i] == 0) {
                moves.push([selected[1] + i, selected[0] + i]);
            } else if (b[selected[1] + i][selected[0] + i].c != sC) {
                moves.push([selected[1] + i, selected[0] + i]);
                finished[0] = true;
            } else {
                finished[0] = true;
            }
        }
        if (!finished[1] && selected[1] + i < 8 && selected[0] - i >= 0) {
            if (b[selected[1] + i][selected[0] - i] == 0) {
                moves.push([selected[1] + i, selected[0] - i]);
            } else if (b[selected[1] + i][selected[0] - i].c != sC) {
                moves.push([selected[1] + i, selected[0] - i]);
                finished[1] = true;
            } else {
                finished[1] = true;
            }
        }
        if (!finished[2] && selected[1] - i >= 0 && selected[0] + i < 8) {
            if (b[selected[1] - i][selected[0] + i] == 0) {
                moves.push([selected[1] - i, selected[0] + i]);
            } else if (b[selected[1] - i][selected[0] + i].c != sC) {
                moves.push([selected[1] - i, selected[0] + i]);
                finished[2] = true;
            } else {
                finished[2] = true;
            }
        }
        if (!finished[3] && selected[1] - i >= 0 && selected[0] - i >= 0) {
            if (b[selected[1] - i][selected[0] - i] == 0) {
                moves.push([selected[1] - i, selected[0] - i]);
            } else if (b[selected[1] - i][selected[0] - i].c != sC) {
                moves.push([selected[1] - i, selected[0] - i]);
                finished[3] = true;
            } else {
                finished[3] = true;
            }
        }
    }
    return moves;
}

function rook(b) {
    let moves = [];
    let finished = [false, false, false, false];
    let sC = b[selected[1]][selected[0]].c;
    for (let i = 1; i < 8; i++) {
        if (!finished[0] && selected[1] + i < 8) {
            if (b[selected[1] + i][selected[0]] == 0) {
                moves.push([selected[1] + i, selected[0]]);
            } else if (b[selected[1] + i][selected[0]].c != sC) {
                moves.push([selected[1] + i, selected[0]]);
                finished[0] = true;
            } else {
                finished[0] = true;
            }
        }
        if (!finished[1] && selected[0] - i >= 0) {
            if (b[selected[1]][selected[0] - i] == 0) {
                moves.push([selected[1], selected[0] - i]);
            } else if (b[selected[1]][selected[0] - i].c != sC) {
                moves.push([selected[1], selected[0] - i]);
                finished[1] = true;
            } else {
                finished[1] = true;
            }
        }
        if (!finished[2] && selected[0] + i < 8) {
            if (b[selected[1]][selected[0] + i] == 0) {
                moves.push([selected[1], selected[0] + i]);
            } else if (b[selected[1]][selected[0] + i].c != sC) {
                moves.push([selected[1], selected[0] + i]);
                finished[2] = true;
            } else {
                finished[2] = true;
            }
        }
        if (!finished[3] && selected[1] - i >= 0) {
            if (b[selected[1] - i][selected[0]] == 0) {
                moves.push([selected[1] - i, selected[0]]);
            } else if (b[selected[1] - i][selected[0]].c != sC) {
                moves.push([selected[1] - i, selected[0]]);
                finished[3] = true;
            } else {
                finished[3] = true;
            }
        }
    }
    return moves;
}

function queen(b) {
    let moves = bishop(b);
    let moves2 = rook(b);
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

function knight(b) {
    let moves = [];
    let sC = b[selected[1]][selected[0]].c;
    const valid = (i, j) => (i < 8 && i > -1 && j < 8 && j > -1 && (b[i][j] == 0 || b[i][j].c != sC)) ? true : false;
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

function king(b) {
    let moves = [];
    let sC = b[selected[1]][selected[0]].c;
    const valid = (i, j) => (i < 8 && i > -1 && j < 8 && j > -1 && (b[i][j] == 0 || b[i][j].c != sC)) ? true : false;
    if (valid(selected[1] + 1, selected[0] + 1)) moves.push([selected[1] + 1, selected[0] + 1]);
    if (valid(selected[1] + 1, selected[0])) moves.push([selected[1] + 1, selected[0]]);
    if (valid(selected[1] + 1, selected[0] - 1)) moves.push([selected[1] + 1, selected[0] - 1]);
    if (valid(selected[1], selected[0] - 1)) moves.push([selected[1], selected[0] - 1]);
    if (valid(selected[1], selected[0] + 1)) moves.push([selected[1], selected[0] + 1]);
    if (valid(selected[1] - 1, selected[0] + 1)) moves.push([selected[1] - 1, selected[0] + 1]);
    if (valid(selected[1] - 1, selected[0])) moves.push([selected[1] - 1, selected[0]]);
    if (valid(selected[1] - 1, selected[0] - 1)) moves.push([selected[1] - 1, selected[0] - 1]);
    if (b[selected[1]][selected[0]].hasMoved == false) {
        if (b[selected[1]][0].hasMoved == false && b[selected[1]][1] == 0 && b[selected[1]][2] == 0 && b[selected[1]][3] == 0) {
            moves.push([selected[1], 2]);
            castling = true;
        }
        if (b[selected[1]][7].hasMoved == false && b[selected[1]][5] == 0 && b[selected[1]][6] == 0) {
            moves.push([selected[1], 6]);
            castling = true;
        }

    }
    return moves;
}

function checkInvalid(moves, b) {
    const storeB = copyBoard(b);
    for (let i = 0; i < moves.length; i++) {
        b = applyMove(moves[i], copyBoard(b));
        if (check((turn % 2 == 0) ? "white" : "black", b)) {
       //     moves.splice(i, 1);
            i--;
        }
        b = copyBoard(storeB);
    }
    return moves;
}

function check(colour, b) {
    let kingX = 0;
    let kingY = 0;
    let out = false;
    for (let i = 0; i < b.length; i++) {
        for (let j = 0; j < b[i].length; j++) {
            if (b[i][j].n == "K" && b[i][j].c == colour) {
                kingX = i;
                kingY = j;
            }
        }
    }
    for (let i = 0; i < b.length; i++) {
        for (let j = 0; j < b[i].length; j++) {
            if (b[i][j] != 0 && b[i][j].c != colour) {
                const store = selected;
                selected = [j, i];
                turn++;
                castling = false;
                enPassant = false;
                let cMoves = getMoves(b);
                turn--;
                for (let k = 0; k < cMoves.length; k++) {
                    if (cMoves[k][1] == kingY && cMoves[k][0] == kingX) {
                        out = true;
                    }
                }
                selected = store;
            }
        }
    }
    return out;
}

displayGrid(board);
displayPieces(board);
//ctx.fillText("R", 0, 0);

document.addEventListener("click", (e) => {
    if (e.target.id == "board") {
        let boardClientPos = $("board").getBoundingClientRect();
        if (selected[0] + selected[1] < 0) {
            selected = [Math.floor((e.clientX - boardClientPos.x) / 100), Math.floor((e.clientY - boardClientPos.y) / 100)];
            updateSelected(board);
        } else {
            let input = [Math.floor((e.clientX - boardClientPos.x) / 100), Math.floor((e.clientY - boardClientPos.y) / 100)];
            for (let i = 0; i < moves.length; i++) {
                if (input[1] == moves[i][0] && input[0] == moves[i][1]) {
                    board = applyMove(moves[i], board);
                    turn++;
                    break;
                }
            }
            selected = [-1, -1];
            displayGrid(board);
            displayPieces(board);
            if (turn % 2 == 1) {
                computerMove();
            }
        }
    }
});

function applyMove(move, b) {
    if (enPassant && move[1] - selected[0] != 0 && b[move[0]][move[1]] == 0) {
        b[selected[1]][moves[i][1]] = 0;
    }
    if (castling && Math.abs(selected[0] - move[1]) > 1) {
        if (move[1] == 2) {
            b[selected[1]][3] = b[selected[1]][0];
            b[selected[1]][0] = 0;
            b[selected[1]][3].hasMoved = true;
            b[selected[1]][3].moveCount++;
            b[selected[1]][3].x = 3;
        } else {
            b[selected[1]][5] = b[selected[1]][7];
            b[selected[1]][7] = 0;
            b[selected[1]][5].hasMoved = true;
            b[selected[1]][5].moveCount++;
            b[selected[1]][5].x = 5;
        }
    }
    b[move[0]][move[1]] = b[selected[1]][selected[0]];
    b[selected[1]][selected[0]] = 0;
    b[move[0]][move[1]].hasMoved = true;
    b[move[0]][move[1]].moveCount++;
    b[move[0]][move[1]].lastTurn = turn;
    b[move[0]][move[1]].x = move[1];
    b[move[0]][move[1]].y = move[0];
    return b;
}

function copyBoard(b) {
    let out = new Array(b.length);
    for (let i = 0; i < b.length; i++) {
        out[i] = new Array(b[i].length);
        for (let j = 0; j < b[i].length; j++) {
            if (b[i][j] == 0) {
                out[i][j] = 0;
            } else {
                out[i][j] = new piece(b[i][j].n, b[i][j].x, b[i][j].y, b[i][j].c);
                out[i][j].hasMoved = b[i][j].hasMoved;
                out[i][j].moveCount = b[i][j].moveCount;
                out[i][j].lastTurn = b[i][j].lastTurn;
            }
        }
    }
    return out;
}

function computerMove() {
    let c = (turn % 2 == 0) ? "white" : "black";
    while (true) {
        let x = Math.floor(Math.random() * 8);
        let y = Math.floor(Math.random() * 8);
        if (board[x][y] != 0 && board[x][y].c == c) {
            selected = [y, x];
            let moves = getMoves(board);
            moves = checkInvalid(moves, board);
            if (moves.length > 0) {
                let indx = Math.floor(Math.random() * moves.length);
                board = applyMove(moves[indx], board);
                selected = [-1, -1];
                displayGrid(board);
                displayPieces(board);
                break;
            }
        }
    }
}

function evaluateBoardState(b, c){
    let score = 0;
    
}

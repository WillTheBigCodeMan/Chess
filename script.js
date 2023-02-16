class piece {
  constructor(name, x, y, colour) {
    this.n = name;
    this.x = x;
    this.y = y;
    this.c = colour;
    this.hasMoved = false;
    this.moveCount = 0;
    this.lastTurn = -1;
    this.img = getImg(this.n, this.c);
  }
  display(ctx) {
    ctx.drawImage(this.img, this.x * 100 + 10, this.y * 100 + 10, 80, 80);
  }
}

function getImg(n, c) {
  let img = "";
  switch (n) {
    case "P":
      if (c == "white") {
        img = document.getElementById("whitePawn");
      } else {
        img = document.getElementById("blackPawn");
      }
      break;
    case "K":
      if (c == "white") {
        img = document.getElementById("whiteKing");
      } else {
        img = document.getElementById("blackKing");
      }
      break;
    case "Q":
      if (c == "white") {
        img = document.getElementById("whiteQueen");
      } else {
        img = document.getElementById("blackQueen");
      }
      break;
    case "B":
      if (c == "white") {
        img = document.getElementById("whiteBishop");
      } else {
        img = document.getElementById("blackBishop");
      }
      break;
    case "Kn":
      if (c == "white") {
        img = document.getElementById("whiteKnight");
      } else {
        img = document.getElementById("blackKnight");
      }
      break;
    case "R":
      if (c == "white") {
        img = document.getElementById("whiteRook");
      } else {
        img = document.getElementById("blackRook");
      }
      break;
  }
  return img;
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

let _depth = 3;

let enPassant = false;
let castling = false;

function displayGrid(b) {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      ctx.fillStyle = ((i + j) % 2 == 1) ? "#779556" : "#EBECD0";
      ctx.fillRect(i * 100, j * 100, 100, 100);
    }
  }
}

function updateSprites() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board[i][j] != 0) {
        board[i][j].img = getImg(board[i][j].n, board[i][j].c);
      }
    }
  }
}

function displayPieces(b) {
  if (b == null) {
    b = board;
  }
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
    moves = checkInvalid(moves, b);
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
  enPassant = false;
  castling = false;
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
  if (selected[1] + mult < 0 || selected[1] + mult > 8) { } else {
    if (b[selected[1] + mult][selected[0]] == 0) {
      moves.push([selected[1] + mult, selected[0]]);
    }
    if (selected[1] + (2 * mult) > 0 && selected[1] + (2 * mult) < 8 && b[selected[1]][selected[0]].hasMoved == false && b[selected[1] + (2 * mult)][selected[0]] == 0 && moves.length > 0) {
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
      moves.splice(i, 1);
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
  let c = false;
  let eP = false;
  if (castling) {
    c = true;
  }
  if (enPassant) {
    eP = true;
  }
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
        let cMoves = getMoves(copyBoard(b));
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
  enPassant = eP;
  castling = c;
  return out;
}

displayGrid(board);
displayPieces(board);

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
          if ((moves[i][0] == 0 || moves[i][0] == 7) && board[moves[i][0]][moves[i][1]].n == "P") {
            board[moves[i][0]][moves[i][1]] = promote(board, moves[i])
          }
          turn++;
          if (checkMate(board)) {
            board = [
              [new piece("R", 0, 0, "black"), new piece("Kn", 1, 0, "black"), new piece("B", 2, 0, "black"), new piece("Q", 3, 0, "black"), new piece("K", 4, 0, "black"), new piece("B", 5, 0, "black"), new piece("Kn", 6, 0, "black"), new piece("R", 7, 0, "black")],
              [new piece("P", 0, 1, "black"), new piece("P", 1, 1, "black"), new piece("P", 2, 1, "black"), new piece("P", 3, 1, "black"), new piece("P", 4, 1, "black"), new piece("P", 5, 1, "black"), new piece("P", 6, 1, "black"), new piece("P", 7, 1, "black")],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [new piece("P", 0, 6, "white"), new piece("P", 1, 6, "white"), new piece("P", 2, 6, "white"), new piece("P", 3, 6, "white"), new piece("P", 4, 6, "white"), new piece("P", 5, 6, "white"), new piece("P", 6, 6, "white"), new piece("P", 7, 6, "white")],
              [new piece("R", 0, 7, "white"), new piece("Kn", 1, 7, "white"), new piece("B", 2, 7, "white"), new piece("Q", 3, 7, "white"), new piece("K", 4, 7, "white"), new piece("B", 5, 7, "white"), new piece("Kn", 6, 7, "white"), new piece("R", 7, 7, "white")]
            ];
            turn = 0;
          }
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
  if (enPassant && move[0] - selected[1] != 0 && b[move[0]][move[1]] == 0) {
    b[selected[1]][move[1]] = 0;
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

function promote(b, move, newPiece) {
  let out = b[move[0]][move[1]];
  if (newPiece == null) {
    out.n = prompt("Enter piece, Kn, B, R or Q");
  } else {
    out.n = newPiece;
  }
  out.img = getImg(out.n, out.c)
  return out;
}

function checkMate(b) {
  let c = (turn % 2 == 0) ? "white" : "black";
  let out = true;
  const storeC = selected;
  if (check(c, copyBoard(b))) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (b[i][j] != 0 && b[i][j].c == c) {
          selected = [j, i];
          if (checkInvalid(getMoves(copyBoard(b)), copyBoard(b)).length > 0) {
            out = false;
            break;
          }
        }
      }
    }
  } else {
    out = false;
  }
  selected = storeC;
  if (out) {
    console.log(c, "lost");
  }
  return out;
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
let positionCount = 0;
let cacheUses = 0;
let cachedMoveList = [];

function computerMove() {
  positionCount = 0;
  cacheUses = 0;
  let c = (turn % 2 == 0) ? "white" : "black";
  let output = minimaxRoot(_depth, board, true, c);
  selected = output[1];
  board = applyMove(output[0], copyBoard(board));
  if ((output[0][0] == 0 || output[0][0] == 7) && board[output[0][0]][output[0][1]].n == "P") {
    board[output[0][0]][output[0][1]] = promote(board, output[0], "Q")
  }
  selected = [-1, -1];
  turn++;
  checkMate(board);
  displayGrid(board);
  displayPieces(board);
  console.log(positionCount, cacheUses, cachedMoveList);
}

var evaluateBoard = function(b) {
  var totalEvaluation = 0;
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      totalEvaluation = totalEvaluation + getPieceValue(b[i][j], j, i);
    }
  }
  return totalEvaluation;
};

var reverseArray = function(array) {
  return array.slice().reverse();
};

var pawnEvalWhite = [
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
  [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
  [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
  [0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
  [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
  [0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
];

var pawnEvalBlack = reverseArray(pawnEvalWhite);

var knightEval = [
  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
  [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
  [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
  [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
  [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
  [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
  [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
];

var bishopEvalWhite = [
  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
  [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
  [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
  [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
  [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
  [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
  [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

var bishopEvalBlack = reverseArray(bishopEvalWhite);

var rookEvalWhite = [
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0]
];

var rookEvalBlack = reverseArray(rookEvalWhite);

var evalQueen = [
  [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
  [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
  [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
  [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
  [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
  [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
  [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
  [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

var kingEvalWhite = [

  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
  [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
  [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
  [2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0]
];

var kingEvalBlack = reverseArray(kingEvalWhite);


var getPieceValue = function(piece, x, y) {
  if (piece === 0) {
    return 0;
  }
  var getAbsoluteValue = function(piece, isWhite, x, y) {
    if (piece.n === 'P') {
      return 10 + (isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x]);
    } else if (piece.n === 'R') {
      return 50 + (isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x]);
    } else if (piece.n === 'Kn') {
      return 30;
    } else if (piece.n === 'B') {
      return 30 + (isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x]);
    } else if (piece.n === 'Q') {
      return 90;
    } else if (piece.n === 'K') {
      return 900 + (isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x]);
    }
  };

  var absoluteValue = getAbsoluteValue(piece, piece.c === 'white', x, y);
  return piece.c === 'white' ? absoluteValue : -absoluteValue;
};

function minimaxRoot(depth, b, isMaxing, c) {
  let possibleMoves = getAllMoves(b, c, false);
  if (cachedMoveList.length > 0) {
    console.log(equalBoards(b, cachedMoveList[11][0]), b, cachedMoveList[11][0]);
  }
  console.log(possibleMoves);
  let highestValue = -9999;
  let bestMove;
  for (let i = 0; i < possibleMoves.length; i++) {
    selected = possibleMoves[i][1];
    turn++;
    let value = minimax(depth - 1, applyMove(possibleMoves[i][0], copyBoard(b)), -10000, 10000, !isMaxing, (c == "black" ? "white" : "black"));
    turn--;
    if (value >= highestValue) {
      highestValue = value;
      bestMove = possibleMoves[i];
    }
  }
  return bestMove;
}

function equalBoards(b1, b2) {
  let out = true;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if ((b1[i][j] == 0 && b2[i][j] != 0) || (b2[i][j] == 0 && b1[i][j] != 0)) out = false;
      if ((b1[i][j] != 0 && b2[i][j] != 0) && (b1[i][j].n != b2[i][j].n || b1[i][j].c != b2[i][j].c)) out = false;
    }
  }
  return out;
}

function getAllMoves(b, c, shouldCache) {
  for (let i = 0; i < cachedMoveList.length; i++) {
    if (shouldCache) {
      //console.log(b, cachedMoveList[i][0])
    }
    if (equalBoards(b, cachedMoveList[i][0])) {
      cacheUses++;
      return cachedMoveList[i][1];
    }
  }
  let possibleMoves = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (b[i][j] != 0 && b[i][j].c == c) {
        selected = [j, i];
        let moves = getMoves(copyBoard(b));
        moves = checkInvalid(moves, copyBoard(b));
        for (let k = 0; k < moves.length; k++) {
          possibleMoves.push([moves[k],
          [j, i]
          ]);
        }
      }
    }
  }
  let flags = [];
  for (let i = 0; i < possibleMoves.length; i++) {
    selected = possibleMoves[i][1];
    if (check((c == "black") ? "white" : "black", copyBoard(applyMove(possibleMoves[i][0], copyBoard(b))))) {
      flags.push("C");
    } else if (b[possibleMoves[i][0][0]][possibleMoves[i][0][1]]) {
      flags.push("T");
    } else {
      flags.push("N");
    }
  }
  let out = [];
  let takesIndex = 0;
  for (let i = 0; i < flags.length; i++) {
    if (flags[i] == "N") {
      out.push(possibleMoves[i]);
    } else if (flags[i] == "C") {
      out.unshift(possibleMoves[i]);
      takesIndex++;
    } else {
      out.splice(takesIndex, 0, possibleMoves[i]);
    }
  }
  if (shouldCache) {
    cachedMoveList.push([b, out]);
    if (cachedMoveList.length > 1000) {
      cachedMoveList.splice(0, 1);
    }
  }
  return out;
}

function minimax(depth, b, alpha, beta, isMaxing, c) {
  positionCount++;
  if (depth == 0) {
    return -evaluateBoard(b);
  }

  let possibleMoves = getAllMoves(b, c, (depth <= _depth - 2 && depth >= _depth - 4));
  if (isMaxing) {
    let bestMove = -9999;
    for (let i = 0; i < possibleMoves.length; i++) {
      selected = possibleMoves[i][1];
      turn++;
      bestMove = Math.max(bestMove, minimax(depth - 1, applyMove(possibleMoves[i][0], copyBoard(b)), alpha, beta, !isMaxing, (c == "black" ? "white" : "black")));
      turn--;
      alpha = Math.max(alpha, bestMove);
      if (beta <= alpha) {
        return bestMove;
      }
    }
    return bestMove;
  } else {
    let bestMove = 9999;
    for (let i = 0; i < possibleMoves.length; i++) {
      selected = possibleMoves[i][1];
      turn++;
      bestMove = Math.min(bestMove, minimax(depth - 1, applyMove(possibleMoves[i][0], copyBoard(b)), alpha, beta, !isMaxing, (c == "black" ? "white" : "black")));
      turn--;
      beta = Math.min(beta, bestMove);
      if (beta <= alpha) {
        return bestMove;
      }
    }
    return bestMove;
  }
}

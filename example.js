var minimaxRoot =function(depth, game, isMaximisingPlayer) {

  var newGameMoves = game.ugly_moves();
  var bestMove = -9999;
  var bestMoveFound;

  for(var i = 0; i < newGameMoves.length; i++) {
      var newGameMove = newGameMoves[i]
      game.ugly_move(newGameMove);
      var value = minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer);
      game.undo();
      if(value >= bestMove) {
          bestMove = value;
          bestMoveFound = newGameMove;
      }
  }
  return bestMoveFound;
};

var minimax = function (depth, game, alpha, beta, isMaximisingPlayer) {
  positionCount++;
  if (depth === 0) {
      return -evaluateBoard(game.board());
  }

  var newGameMoves = game.ugly_moves();

  if (isMaximisingPlayer) {
      var bestMove = -9999;
      for (var i = 0; i < newGameMoves.length; i++) {
          game.ugly_move(newGameMoves[i]);
          bestMove = Math.max(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
          game.undo();
          alpha = Math.max(alpha, bestMove);
          if (beta <= alpha) {
              return bestMove;
          }
      }
      return bestMove;
  } else {
      var bestMove = 9999;
      for (var i = 0; i < newGameMoves.length; i++) {
          game.ugly_move(newGameMoves[i]);
          bestMove = Math.min(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
          game.undo();
          beta = Math.min(beta, bestMove);
          if (beta <= alpha) {
              return bestMove;
          }
      }
      return bestMove;
  }
};

var evaluateBoard = function(board) {
  var totalEvaluation = 0;
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
    }
  }
  return totalEvaluation;
};

var getPieceValue = function(piece) {
  if (piece === null) {
    return 0;
  }
  var getAbsoluteValue = function(piece) {
    if (piece.type === 'p') {
      return 10;
    } else if (piece.type === 'r') {
      return 50;
    } else if (piece.type === 'n') {
      return 30;
    } else if (piece.type === 'b') {
      return 30;
    } else if (piece.type === 'q') {
      return 90;
    } else if (piece.type === 'k') {
      return 900;
    }
    throw "Unknown piece type: " + piece.type;
  };

  var absoluteValue = getAbsoluteValue(piece, piece.color === 'w');
  return piece.color === 'w' ? absoluteValue : -absoluteValue;
};
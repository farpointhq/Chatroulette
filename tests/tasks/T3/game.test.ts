import { describe, it, expect } from 'vitest';
import {
  createGame, createGameFromFEN, makeMove, canMakeMove,
  getGameResult, isCheckmate, isStalemate, isDraw,
  isInsufficientMaterial, undoMove, getMoveHistory,
} from '../../../src/engine/game';
import { parseSquare } from '../../../src/engine/board';
import { STARTING_FEN, parseFEN } from '../../../src/engine/fen';

describe('Game — Creation', () => {
  it('createGame returns a new game with starting position', () => {
    const game = createGame();
    expect(game.state.turn).toBe('white');
    expect(game.moveHistory).toHaveLength(0);
    expect(game.result).toBe('ongoing');
    expect(game.winner).toBeNull();
  });

  it('createGameFromFEN loads arbitrary position', () => {
    const game = createGameFromFEN('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    expect(game.state.turn).toBe('black');
    expect(game.state.enPassantTarget).toEqual({ file: 'e', rank: 3 });
    expect(game.moveHistory).toHaveLength(0);
  });
});

describe('Game — Make Move', () => {
  it('executes a valid pawn move', () => {
    const game = createGame();
    const newGame = makeMove(game, parseSquare('e2'), parseSquare('e4'));

    expect(newGame.state.turn).toBe('black');
    expect(newGame.state.board[4][3]).toEqual({ type: 'pawn', color: 'white' });
    expect(newGame.state.board[4][1]).toBeNull();
    expect(newGame.moveHistory).toHaveLength(1);
    expect(newGame.moveHistory[0].piece.type).toBe('pawn');
  });

  it('executes a knight move', () => {
    const game = createGame();
    const newGame = makeMove(game, parseSquare('g1'), parseSquare('f3'));

    expect(newGame.state.turn).toBe('black');
    expect(newGame.state.board[5][2]).toEqual({ type: 'knight', color: 'white' });
    expect(newGame.state.board[6][0]).toBeNull();
  });

  it('captures a piece', () => {
    const game = createGameFromFEN('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
    const newGame = makeMove(game, parseSquare('e4'), parseSquare('d5'));

    expect(newGame.state.board[3][4]).toEqual({ type: 'pawn', color: 'white' });
    expect(newGame.moveHistory[0].capturedPiece).toEqual({ type: 'pawn', color: 'black' });
    expect(newGame.state.halfmoveClock).toBe(0);
  });

  it('rejects illegal moves', () => {
    const game = createGame();
    expect(() => makeMove(game, parseSquare('e2'), parseSquare('e5'))).toThrow();
    expect(() => makeMove(game, parseSquare('e2'), parseSquare('d3'))).toThrow();
  });

  it('rejects moves that leave own king in check', () => {
    const game = createGameFromFEN('rnb1kbnr/pppp1ppp/8/4p3/5Pq1/8/PPPPP1PP/RNBQKBNR w KQkq - 1 3');
    expect(() => makeMove(game, parseSquare('d2'), parseSquare('d3'))).toThrow();
  });

  it('increments fullmove number after black moves', () => {
    const game = createGameFromFEN('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    const newGame = makeMove(game, parseSquare('e7'), parseSquare('e5'));
    expect(newGame.state.fullmoveNumber).toBe(2);
  });

  it('resets halfmove clock on pawn move', () => {
    const game = createGameFromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 50 1');
    const newGame = makeMove(game, parseSquare('e2'), parseSquare('e4'));
    expect(newGame.state.halfmoveClock).toBe(0);
  });

  it('increments halfmove clock on non-pawn, non-capture move', () => {
    const game = createGameFromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 10 1');
    const newGame = makeMove(game, parseSquare('g1'), parseSquare('f3'));
    expect(newGame.state.halfmoveClock).toBe(11);
  });

  it('sets en passant target after double pawn push', () => {
    const game = createGame();
    const newGame = makeMove(game, parseSquare('e2'), parseSquare('e4'));
    expect(newGame.state.enPassantTarget).toEqual({ file: 'e', rank: 3 });
  });

  it('clears en passant target on non-pawn move', () => {
    const game = createGameFromFEN('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    const newGame = makeMove(game, parseSquare('g8'), parseSquare('f6'));
    expect(newGame.state.enPassantTarget).toBeNull();
  });
});

describe('Game — canMakeMove', () => {
  it('returns true for legal moves', () => {
    const game = createGame();
    expect(canMakeMove(game, parseSquare('e2'), parseSquare('e4'))).toBe(true);
  });

  it('returns false for illegal moves', () => {
    const game = createGame();
    expect(canMakeMove(game, parseSquare('e2'), parseSquare('e5'))).toBe(false);
  });

  it('returns false for moves that leave king in check', () => {
    const game = createGameFromFEN('rnb1kbnr/pppp1ppp/8/4p3/5Pq1/8/PPPPP1PP/RNBQKBNR w KQkq - 1 3');
    expect(canMakeMove(game, parseSquare('d2'), parseSquare('d3'))).toBe(false);
  });
});

describe('Game — Game Over Detection', () => {
  it('detects checkmate — fools mate', () => {
    const state = parseFEN('rnb1kbnr/pppp1ppp/8/4p3/5Pq1/8/PPPPP1PP/RNBQKBNR w KQkq - 1 3');
    expect(isCheckmate(state, 'white')).toBe(true);
    expect(isStalemate(state, 'white')).toBe(false);
  });

  it('detects stalemate', () => {
    const state = parseFEN('8/8/8/8/8/7k/7p/7K w - - 0 1');
    expect(isStalemate(state, 'black')).toBe(true);
    expect(isCheckmate(state, 'black')).toBe(false);
  });

  it('detects insufficient material — king vs king', () => {
    const state = parseFEN('8/8/8/4k3/8/8/8/4K3 w - - 0 1');
    expect(isInsufficientMaterial(state)).toBe(true);
  });

  it('detects insufficient material — king and bishop vs king', () => {
    const state = parseFEN('8/8/8/4k3/8/8/8/4KB2 w - - 0 1');
    expect(isInsufficientMaterial(state)).toBe(true);
  });

  it('detects insufficient material — king and knight vs king', () => {
    const state = parseFEN('8/8/8/4k3/8/8/8/4KN2 w - - 0 1');
    expect(isInsufficientMaterial(state)).toBe(true);
  });

  it('does not flag sufficient material as insufficient', () => {
    const state = parseFEN('8/8/8/4k3/8/8/8/4KQ2 w - - 0 1');
    expect(isInsufficientMaterial(state)).toBe(false);
  });

  it('getGameResult returns checkmate', () => {
    const state = parseFEN('rnb1kbnr/pppp1ppp/8/4p3/5Pq1/8/PPPPP1PP/RNBQKBNR w KQkq - 1 3');
    const result = getGameResult(state);
    expect(result.result).toBe('checkmate');
    expect(result.winner).toBe('black');
  });

  it('getGameResult returns ongoing for starting position', () => {
    const state = parseFEN(STARTING_FEN);
    const result = getGameResult(state);
    expect(result.result).toBe('ongoing');
    expect(result.winner).toBeNull();
  });

  it('getGameResult returns stalemate', () => {
    const state = parseFEN('8/8/8/8/8/7k/7p/7K w - - 0 1');
    const result = getGameResult(state);
    expect(result.result).toBe('stalemate');
    expect(result.winner).toBeNull();
  });

  it('getGameResult returns draw for insufficient material', () => {
    const state = parseFEN('8/8/8/4k3/8/8/8/4K3 w - - 0 1');
    const result = getGameResult(state);
    expect(result.result).toBe('insufficient');
    expect(result.winner).toBeNull();
  });
});

describe('Game — Castling', () => {
  it('executes kingside castling', () => {
    const game = createGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const newGame = makeMove(game, parseSquare('e1'), parseSquare('g1'));

    expect(newGame.state.board[6][0]).toEqual({ type: 'king', color: 'white' });
    expect(newGame.state.board[5][0]).toEqual({ type: 'rook', color: 'white' });
    expect(newGame.state.board[4][0]).toBeNull();
    expect(newGame.state.board[7][0]).toBeNull();
    expect(newGame.state.castlingRights.whiteKingside).toBe(false);
    expect(newGame.state.castlingRights.whiteQueenside).toBe(false);
  });

  it('executes queenside castling', () => {
    const game = createGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const newGame = makeMove(game, parseSquare('e1'), parseSquare('c1'));

    expect(newGame.state.board[2][0]).toEqual({ type: 'king', color: 'white' });
    expect(newGame.state.board[3][0]).toEqual({ type: 'rook', color: 'white' });
    expect(newGame.state.board[4][0]).toBeNull();
    expect(newGame.state.board[0][0]).toBeNull();
  });

  it('prevents castling through check', () => {
    const game = createGameFromFEN('r3k2r/pppppppp/8/8/8/5R2/PPPPPPPP/R3K2R w KQkq - 0 1');
    expect(() => makeMove(game, parseSquare('e1'), parseSquare('g1'))).toThrow();
  });
});

describe('Game — En Passant', () => {
  it('executes en passant capture', () => {
    const game = createGameFromFEN('rnbqkbnr/pppppppp/8/8/4Pp2/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    const newGame = makeMove(game, parseSquare('f4'), parseSquare('e3'));

    expect(newGame.state.board[4][2]).toEqual({ type: 'pawn', color: 'black' });
    expect(newGame.state.board[4][3]).toBeNull(); // captured pawn removed
    expect(newGame.moveHistory[0].isEnPassant).toBe(true);
  });
});

describe('Game — Pawn Promotion', () => {
  it('promotes pawn to queen by default', () => {
    const game = createGameFromFEN('8/4P3/8/8/8/8/8/8 w - - 0 1');
    const newGame = makeMove(game, parseSquare('e7'), parseSquare('e8'));

    expect(newGame.state.board[4][7]).toEqual({ type: 'queen', color: 'white' });
    expect(newGame.moveHistory[0].promotion).toBe('queen');
  });

  it('promotes pawn to specified piece', () => {
    const game = createGameFromFEN('8/4P3/8/8/8/8/8/8 w - - 0 1');
    const newGame = makeMove(game, parseSquare('e7'), parseSquare('e8'), 'rook');

    expect(newGame.state.board[4][7]).toEqual({ type: 'rook', color: 'white' });
    expect(newGame.moveHistory[0].promotion).toBe('rook');
  });

  it('promotes black pawn', () => {
    const game = createGameFromFEN('8/8/8/8/8/8/4p3/8 b - - 0 1');
    const newGame = makeMove(game, parseSquare('e2'), parseSquare('e1'), 'knight');

    expect(newGame.state.board[4][0]).toEqual({ type: 'knight', color: 'black' });
    expect(newGame.moveHistory[0].promotion).toBe('knight');
  });
});

describe('Game — Undo', () => {
  it('undo reverts a move', () => {
    const game = createGame();
    const afterMove = makeMove(game, parseSquare('e2'), parseSquare('e4'));
    const afterUndo = undoMove(afterMove);

    expect(afterUndo.state.board[4][1]).toEqual({ type: 'pawn', color: 'white' });
    expect(afterUndo.state.board[4][3]).toBeNull();
    expect(afterUndo.state.turn).toBe('white');
    expect(afterUndo.moveHistory).toHaveLength(0);
  });

  it('undo restores castling rights', () => {
    const game = createGame();
    const afterMove = makeMove(game, parseSquare('e2'), parseSquare('e4'));
    const afterUndo = undoMove(afterMove);

    expect(afterUndo.state.castlingRights).toEqual({
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    });
  });

  it('undo restores captured piece', () => {
    const game = createGameFromFEN('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
    const afterMove = makeMove(game, parseSquare('e4'), parseSquare('d5'));
    const afterUndo = undoMove(afterMove);

    expect(afterUndo.state.board[3][4]).toEqual({ type: 'pawn', color: 'black' });
  });

  it('throws when no moves to undo', () => {
    const game = createGame();
    expect(() => undoMove(game)).toThrow();
  });
});

describe('Game — Move History', () => {
  it('tracks move history', () => {
    const game = createGame();
    const afterMove1 = makeMove(game, parseSquare('e2'), parseSquare('e4'));
    const afterMove2 = makeMove(afterMove1, parseSquare('e7'), parseSquare('e5'));

    expect(afterMove2.moveHistory).toHaveLength(2);
    expect(afterMove2.moveHistory[0].from).toEqual({ file: 'e', rank: 2 });
    expect(afterMove2.moveHistory[0].to).toEqual({ file: 'e', rank: 4 });
    expect(afterMove2.moveHistory[1].from).toEqual({ file: 'e', rank: 7 });
    expect(afterMove2.moveHistory[1].to).toEqual({ file: 'e', rank: 5 });
  });

  it('getMoveHistory returns copy', () => {
    const game = createGame();
    const afterMove = makeMove(game, parseSquare('e2'), parseSquare('e4'));
    const history = getMoveHistory(afterMove);
    expect(history).toHaveLength(1);
    // Mutating should not affect game
    history.pop();
    expect(afterMove.moveHistory).toHaveLength(1);
  });
});

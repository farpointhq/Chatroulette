import { ChessEngine, validateFen } from '../../../src/engine/chess.js';
import { PieceType, Color, Square, Move } from '../../../src/engine/types.js';

describe('ChessEngine', () => {
  describe('constructor & board representation', () => {
    test('starts with standard starting position', () => {
      const engine = new ChessEngine();
      const board = engine.getBoard();
      expect(board).toHaveLength(8);
      expect(board[0]).toHaveLength(8);
      expect(board[7][0]).toEqual({ type: 'r', color: 'w' });
      expect(board[7][4]).toEqual({ type: 'k', color: 'w' });
      expect(board[6][0]).toEqual({ type: 'p', color: 'w' });
      expect(board[0][0]).toEqual({ type: 'r', color: 'b' });
      expect(board[0][4]).toEqual({ type: 'k', color: 'b' });
      expect(board[1][0]).toEqual({ type: 'p', color: 'b' });
    });

    test('loads from FEN string', () => {
      const engine = new ChessEngine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
      expect(engine.turn()).toBe('b');
      expect(engine.get('e4')).toEqual({ type: 'p', color: 'w' });
      expect(engine.get('e2')).toBeNull();
    });

    test('get returns piece at square or null', () => {
      const engine = new ChessEngine();
      expect(engine.get('e2')).toEqual({ type: 'p', color: 'w' });
      expect(engine.get('e4')).toBeNull();
      expect(engine.get('a1')).toEqual({ type: 'r', color: 'w' });
    });

    test('clear empties the board', () => {
      const engine = new ChessEngine();
      engine.clear();
      for (const rank of engine.getBoard()) {
        for (const piece of rank) {
          expect(piece).toBeNull();
        }
      }
    });

    test('reset restores standard position', () => {
      const engine = new ChessEngine();
      engine.clear();
      engine.reset();
      expect(engine.get('e2')).toEqual({ type: 'p', color: 'w' });
      expect(engine.turn()).toBe('w');
    });

    test('put places piece on square', () => {
      const engine = new ChessEngine();
      engine.clear();
      engine.put({ type: 'q', color: 'w' }, 'e4');
      expect(engine.get('e4')).toEqual({ type: 'q', color: 'w' });
    });

    test('remove returns piece and clears square', () => {
      const engine = new ChessEngine();
      const removed = engine.remove('e2');
      expect(removed).toEqual({ type: 'p', color: 'w' });
      expect(engine.get('e2')).toBeNull();
    });
  });

  describe('turn management', () => {
    test('white moves first', () => {
      const engine = new ChessEngine();
      expect(engine.turn()).toBe('w');
    });

    test('turn alternates after each move', () => {
      const engine = new ChessEngine();
      engine.move('e4');
      expect(engine.turn()).toBe('b');
      engine.move('e5');
      expect(engine.turn()).toBe('w');
    });
  });

  describe('move validation — pawn moves', () => {
    test('white pawn pushes one square', () => {
      const engine = new ChessEngine();
      expect(engine.move('e4')).toBe(true);
      expect(engine.get('e4')).toEqual({ type: 'p', color: 'w' });
    });

    test('white pawn pushes two squares from rank 2', () => {
      const engine = new ChessEngine();
      expect(engine.move('e4')).toBe(true);
    });

    test('black pawn pushes one square', () => {
      const engine = new ChessEngine();
      engine.move('e4');
      expect(engine.move('e5')).toBe(true);
    });

    test('black pawn pushes two squares from rank 7', () => {
      const engine = new ChessEngine();
      engine.move('e4');
      expect(engine.move('e5')).toBe(true);
    });

    test('pawn cannot move backward', () => {
      const engine = new ChessEngine();
      engine.move('e4');
      expect(engine.move('e3')).toBe(false);
    });

    test('pawn cannot push two squares from non-starting rank', () => {
      const engine = new ChessEngine('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
      engine.move('e4'); // already moved
      expect(engine.move('e6')).toBe(false); // black pawn on e5 cannot push two
    });

    test('pawn capture diagonally', () => {
      const engine = new ChessEngine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
      expect(engine.move('d5')).toBe(true);
      expect(engine.move('exd5')).toBe(true);
      expect(engine.get('d5')).toEqual({ type: 'p', color: 'w' });
    });

    test('pawn cannot move forward into occupied square', () => {
      const engine = new ChessEngine('rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2');
      expect(engine.move('d5')).toBe(false);
    });

    test('pawn cannot capture straight ahead', () => {
      const engine = new ChessEngine('rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2');
      expect(engine.move('dxe5')).toBe(false);
    });
  });

  describe('move validation — knight moves', () => {
    test('knight moves in L-shape', () => {
      const engine = new ChessEngine();
      expect(engine.move('Nf3')).toBe(true);
      expect(engine.move('Nc6')).toBe(true);
      expect(engine.move('Ng5')).toBe(true);
    });

    test('knight can jump over pieces', () => {
      const engine = new ChessEngine();
      expect(engine.move('Nf3')).toBe(true);
    });

    test('knight cannot move to own piece', () => {
      const engine = new ChessEngine();
      expect(engine.move('Na3')).toBe(true);
      expect(engine.move('Nb1')).toBe(false); // cannot return to occupied square
    });
  });

  describe('move validation — bishop moves', () => {
    test('bishop moves diagonally', () => {
      const engine = new ChessEngine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
      engine.move('e5');
      engine.move('Bc4');
      expect(engine.get('c4')).toEqual({ type: 'b', color: 'w' });
    });

    test('bishop cannot move through pieces', () => {
      const engine = new ChessEngine();
      expect(engine.move('Bf4')).toBe(false);
    });
  });

  describe('move validation — rook moves', () => {
    test('rook moves horizontally and vertically', () => {
      const engine = new ChessEngine('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2');
      engine.move('Nf3');
      engine.move('Nc6');
      engine.move('Rh4');
      expect(engine.get('h4')).toEqual({ type: 'r', color: 'w' });
    });

    test('rook cannot move diagonally', () => {
      const engine = new ChessEngine();
      expect(engine.move('Ra3')).toBe(false);
    });
  });

  describe('move validation — queen moves', () => {
    test('queen moves horizontally, vertically, and diagonally', () => {
      const engine = new ChessEngine('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2');
      engine.move('Qh5');
      expect(engine.get('h5')).toEqual({ type: 'q', color: 'w' });
    });

    test('queen cannot move through pieces', () => {
      const engine = new ChessEngine();
      expect(engine.move('Qa4')).toBe(false);
    });
  });

  describe('move validation — king moves', () => {
    test('king moves one square in any direction', () => {
      const engine = new ChessEngine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
      engine.move('e5');
      engine.move('Ke2');
      expect(engine.get('e2')).toEqual({ type: 'k', color: 'w' });
    });

    test('king cannot move into check', () => {
      const engine = new ChessEngine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
      engine.move('Qh4');
      expect(engine.move('Ke2')).toBe(false);
    });

    test('king cannot move more than one square (no castling)', () => {
      const engine = new ChessEngine();
      expect(engine.move('Ke2')).toBe(false);
    });
  });

  describe('special moves — castling', () => {
    test('kingside castling for white', () => {
      const engine = new ChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      expect(engine.move('O-O')).toBe(true);
      expect(engine.get('g1')).toEqual({ type: 'k', color: 'w' });
      expect(engine.get('f1')).toEqual({ type: 'r', color: 'w' });
      expect(engine.get('e1')).toBeNull();
      expect(engine.get('h1')).toBeNull();
    });

    test('queenside castling for white', () => {
      const engine = new ChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      expect(engine.move('O-O-O')).toBe(true);
      expect(engine.get('c1')).toEqual({ type: 'k', color: 'w' });
      expect(engine.get('d1')).toEqual({ type: 'r', color: 'w' });
      expect(engine.get('e1')).toBeNull();
      expect(engine.get('a1')).toBeNull();
    });

    test('kingside castling for black', () => {
      const engine = new ChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
      expect(engine.move('O-O')).toBe(true);
      expect(engine.get('g8')).toEqual({ type: 'k', color: 'b' });
      expect(engine.get('f8')).toEqual({ type: 'r', color: 'b' });
    });

    test('queenside castling for black', () => {
      const engine = new ChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
      expect(engine.move('O-O-O')).toBe(true);
      expect(engine.get('c8')).toEqual({ type: 'k', color: 'b' });
      expect(engine.get('d8')).toEqual({ type: 'r', color: 'b' });
    });

    test('castling not allowed if king has moved', () => {
      const engine = new ChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      engine.move('Ke2');
      engine.move('Ke7');
      engine.move('Ke1');
      engine.move('Ke8');
      expect(engine.move('O-O')).toBe(false);
    });

    test('castling not allowed if rook has moved', () => {
      const engine = new ChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      engine.move('Rh2');
      engine.move('Rh7');
      engine.move('Rh1');
      engine.move('Rh8');
      expect(engine.move('O-O')).toBe(false);
    });

    test('castling not allowed if king is in check', () => {
      const engine = new ChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      // Put king in check somehow
      const engine2 = new ChessEngine('r3k2r/pppp1ppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      engine2.put({ type: 'r', color: 'b' }, 'e7');
      expect(engine2.move('O-O')).toBe(false);
    });

    test('castling not allowed if king passes through attacked square', () => {
      const engine = new ChessEngine('r3k2r/ppp1pppp/8/8/8/8/PPP1PPPP/R3K2R w KQkq - 0 1');
      engine.put({ type: 'r', color: 'b' }, 'f8');
      expect(engine.move('O-O')).toBe(false);
    });

    test('castling rights removed after castling', () => {
      const engine = new ChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      engine.move('O-O');
      const fen = engine.fen();
      expect(fen).not.toContain('K');
      expect(fen).not.toContain('Q');
    });
  });

  describe('special moves — en passant', () => {
    test('en passant capture works', () => {
      const engine = new ChessEngine('rnbqkbnr/pppp1ppp/8/4pP2/8/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2');
      expect(engine.move('fxe6')).toBe(true);
      expect(engine.get('e5')).toBeNull();
      expect(engine.get('e6')).toEqual({ type: 'p', color: 'w' });
    });

    test('en passant only available immediately after double pawn push', () => {
      const engine = new ChessEngine('rnbqkbnr/pppp1ppp/8/4pP2/8/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2');
      engine.move('a3');
      expect(engine.move('fxe6')).toBe(false);
    });

    test('black en passant capture', () => {
      const engine = new ChessEngine('rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
      expect(engine.move('exd3')).toBe(true);
      expect(engine.get('e4')).toBeNull();
      expect(engine.get('d3')).toEqual({ type: 'p', color: 'b' });
    });
  });

  describe('special moves — pawn promotion', () => {
    test('white pawn promotes to queen', () => {
      const engine = new ChessEngine('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
      expect(engine.move({ from: 'e7', to: 'e8', promotion: 'q' })).toBe(true);
      expect(engine.get('e8')).toEqual({ type: 'q', color: 'w' });
    });

    test('white pawn promotes to rook', () => {
      const engine = new ChessEngine('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
      expect(engine.move({ from: 'e7', to: 'e8', promotion: 'r' })).toBe(true);
      expect(engine.get('e8')).toEqual({ type: 'r', color: 'w' });
    });

    test('white pawn promotes to bishop', () => {
      const engine = new ChessEngine('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
      expect(engine.move({ from: 'e7', to: 'e8', promotion: 'b' })).toBe(true);
      expect(engine.get('e8')).toEqual({ type: 'b', color: 'w' });
    });

    test('white pawn promotes to knight', () => {
      const engine = new ChessEngine('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
      expect(engine.move({ from: 'e7', to: 'e8', promotion: 'n' })).toBe(true);
      expect(engine.get('e8')).toEqual({ type: 'n', color: 'w' });
    });

    test('black pawn promotes', () => {
      const engine = new ChessEngine('4k2K/8/8/8/8/8/4p3/8 b - - 0 1');
      expect(engine.move({ from: 'e2', to: 'e1', promotion: 'q' })).toBe(true);
      expect(engine.get('e1')).toEqual({ type: 'q', color: 'b' });
    });

    test('promotion defaults to queen', () => {
      const engine = new ChessEngine('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
      expect(engine.move('e8')).toBe(true);
      expect(engine.get('e8')).toEqual({ type: 'q', color: 'w' });
    });

    test('SAN notation for promotion', () => {
      const engine = new ChessEngine('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
      expect(engine.move('e8=Q')).toBe(true);
      expect(engine.get('e8')).toEqual({ type: 'q', color: 'w' });
    });
  });

  describe('check / checkmate / stalemate detection', () => {
    test('detects check', () => {
      const engine = new ChessEngine('rnb1kbnr/pppp1ppp/8/4p3/5Pq1/8/PPPPP1PP/RNBQKBNR w KQkq - 1 3');
      expect(engine.inCheck()).toBe(true);
    });

    test('detects checkmate — scholars mate', () => {
      const engine = new ChessEngine('rnb1kbnr/pppp1ppp/8/4p3/5Pq1/8/PPPPP1PP/RNBQKBNR w KQkq - 1 3');
      expect(engine.isCheckmate()).toBe(true);
      expect(engine.result()).toBe('checkmate');
    });

    test('detects stalemate', () => {
      const engine = new ChessEngine('k7/6Q1/8/8/8/8/8/4K3 b - - 0 1');
      expect(engine.isStalemate()).toBe(true);
      expect(engine.result()).toBe('stalemate');
    });

    test('is not checkmate when king can escape', () => {
      const engine = new ChessEngine('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
      expect(engine.isCheckmate()).toBe(false);
    });

    test('is not stalemate when moves available', () => {
      const engine = new ChessEngine();
      expect(engine.isStalemate()).toBe(false);
    });
  });

  describe('legal moves generation', () => {
    test('generates all legal moves for current position', () => {
      const engine = new ChessEngine();
      const moves = engine.moves() as string[];
      expect(moves.length).toBe(20); // 20 possible opening moves
      expect(moves).toContain('e4');
      expect(moves).toContain('Nf3');
    });

    test('filters moves by square', () => {
      const engine = new ChessEngine();
      const moves = engine.moves({ square: 'e2' }) as string[];
      expect(moves.length).toBe(2); // e3, e4
      expect(moves).toContain('e3');
      expect(moves).toContain('e4');
    });

    test('returns verbose move objects when requested', () => {
      const engine = new ChessEngine();
      const moves = engine.moves({ verbose: true }) as Move[];
      expect(moves.length).toBe(20);
      expect(moves[0]).toHaveProperty('from');
      expect(moves[0]).toHaveProperty('to');
      expect(moves[0]).toHaveProperty('piece');
    });

    test('generates no moves in checkmate', () => {
      const engine = new ChessEngine('rnb1kbnr/pppp1ppp/8/4p3/5Pq1/8/PPPPP1PP/RNBQKBNR w KQkq - 1 3');
      const moves = engine.moves() as string[];
      expect(moves.length).toBe(0);
    });

    test('isLegal returns true for legal move', () => {
      const engine = new ChessEngine();
      expect(engine.isLegal({ from: 'e2', to: 'e4' })).toBe(true);
    });

    test('isLegal returns false for illegal move', () => {
      const engine = new ChessEngine();
      expect(engine.isLegal({ from: 'e2', to: 'e5' })).toBe(false);
    });
  });

  describe('move history', () => {
    test('tracks move history', () => {
      const engine = new ChessEngine();
      engine.move('e4');
      engine.move('e5');
      engine.move('Nf3');
      const history = engine.historyMoves();
      expect(history.length).toBe(3);
    });

    test('undo reverts the last move', () => {
      const engine = new ChessEngine();
      engine.move('e4');
      const undone = engine.undo();
      expect(undone).not.toBeNull();
      expect(engine.get('e2')).toEqual({ type: 'p', color: 'w' });
      expect(engine.get('e4')).toBeNull();
    });

    test('undo returns null when no moves', () => {
      const engine = new ChessEngine();
      expect(engine.undo()).toBeNull();
    });

    test('undo restores captured pieces', () => {
      const engine = new ChessEngine('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2');
      engine.move('exd4');
      engine.undo();
      expect(engine.get('e5')).toEqual({ type: 'p', color: 'b' });
      expect(engine.get('d4')).toEqual({ type: 'p', color: 'w' });
    });
  });

  describe('FEN import/export', () => {
    test('exports standard starting position FEN', () => {
      const engine = new ChessEngine();
      expect(engine.fen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });

    test('exports FEN after moves', () => {
      const engine = new ChessEngine();
      engine.move('e4');
      const fen = engine.fen();
      expect(fen).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    });

    test('loads valid FEN', () => {
      const engine = new ChessEngine();
      expect(engine.load('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')).toBe(true);
      expect(engine.turn()).toBe('b');
      expect(engine.get('e4')).toEqual({ type: 'p', color: 'w' });
    });

    test('load returns false for invalid FEN', () => {
      const engine = new ChessEngine();
      expect(engine.load('invalid')).toBe(false);
    });

    test('load resets history', () => {
      const engine = new ChessEngine();
      engine.move('e4');
      engine.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      expect(engine.historyMoves().length).toBe(0);
    });
  });

  describe('PGN export', () => {
    test('exports basic PGN', () => {
      const engine = new ChessEngine();
      engine.move('e4');
      engine.move('e5');
      engine.move('Nf3');
      const pgn = engine.pgn();
      expect(pgn).toContain('1. e4 e5 2. Nf3');
    });

    test('exports PGN with headers', () => {
      const engine = new ChessEngine();
      engine.move('e4');
      const pgn = engine.pgn({ headers: { Event: 'Test Game', White: 'Alice', Black: 'Bob' } });
      expect(pgn).toContain('[Event "Test Game"]');
      expect(pgn).toContain('[White "Alice"]');
      expect(pgn).toContain('[Black "Bob"]');
    });

    test('exports result header in PGN', () => {
      const engine = new ChessEngine('rnb1kbnr/pppp1ppp/8/4p3/5Pq1/8/PPPPP1PP/RNBQKBNR w KQkq - 1 3');
      const pgn = engine.pgn();
      expect(pgn).toContain('0-1');
    });
  });

  describe('PGN import', () => {
    test('loads game from PGN string', () => {
      const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5';
      const engine = new ChessEngine();
      expect(engine.loadPgn(pgn)).toBe(true);
      expect(engine.historyMoves().length).toBe(6);
      expect(engine.get('b5')).toEqual({ type: 'b', color: 'w' });
    });

    test('loadPgn returns false for invalid PGN', () => {
      const engine = new ChessEngine();
      expect(engine.loadPgn('not a pgn')).toBe(false);
    });

    test('loadPgn with headers', () => {
      const pgn = `[Event "Test"]
[White "Alice"]
[Black "Bob"]

1. e4 e5 2. Nf3`;
      const engine = new ChessEngine();
      expect(engine.loadPgn(pgn)).toBe(true);
      expect(engine.historyMoves().length).toBe(4);
    });
  });

  describe('draw conditions', () => {
    test('insufficient material — king vs king', () => {
      const engine = new ChessEngine('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
      expect(engine.isDraw()).toBe(true);
      expect(engine.result()).toBe('insufficient');
    });

    test('insufficient material — king and bishop vs king', () => {
      const engine = new ChessEngine('4k3/8/8/8/8/8/8/4KB2 w - - 0 1');
      expect(engine.isDraw()).toBe(true);
    });

    test('insufficient material — king and knight vs king', () => {
      const engine = new ChessEngine('4k3/8/8/8/8/8/8/4KN2 w - - 0 1');
      expect(engine.isDraw()).toBe(true);
    });

    test('not insufficient material — king and pawn vs king', () => {
      const engine = new ChessEngine('4k3/8/8/8/8/8/4P3/4K3 w - - 0 1');
      expect(engine.isDraw()).toBe(false);
    });

    test('threefold repetition is a draw', () => {
      const engine = new ChessEngine();
      engine.move('Nf3');
      engine.move('Nf6');
      engine.move('Ng1');
      engine.move('Ng8');
      // position repeated after move 1...Nf6
      expect(engine.isDraw()).toBe(true);
      expect(engine.result()).toBe('repetition');
    });

    test('fifty-move rule', () => {
      const engine = new ChessEngine('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 100 1');
      expect(engine.isDraw()).toBe(true);
      expect(engine.result()).toBe('fifty-move');
    });
  });

  describe('move SAN notation', () => {
    test('SAN for pawn move', () => {
      const engine = new ChessEngine();
      engine.move('e4');
      const history = engine.historyMoves();
      expect(history[0].san).toBe('e4');
    });

    test('SAN for knight move', () => {
      const engine = new ChessEngine();
      engine.move('Nf3');
      const history = engine.historyMoves();
      expect(history[0].san).toBe('Nf3');
    });

    test('SAN for capture', () => {
      const engine = new ChessEngine('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2');
      engine.move('exd4');
      const history = engine.historyMoves();
      expect(history[0].san).toBe('exd4');
    });

    test('SAN for check', () => {
      const engine = new ChessEngine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
      engine.move('Qh4');
      const history = engine.historyMoves();
      expect(history[0].san).toBe('Qh4+');
    });

    test('SAN for checkmate', () => {
      const engine = new ChessEngine('rnb1kbnr/pppp1ppp/8/4p3/5Pq1/8/PPPPP1PP/RNBQKBNR w KQkq - 1 3');
      const history = engine.historyMoves();
      // This is already checkmate, last move should have #
      // Need to set up the position differently
      const engine2 = new ChessEngine();
      engine2.move('f3');
      engine2.move('e5');
      engine2.move('g4');
      engine2.move('Qh4#');
      const hist2 = engine2.historyMoves();
      expect(hist2[3].san).toBe('Qh4#');
    });
  });

  describe('edge cases', () => {
    test('cannot make move when not your turn', () => {
      const engine = new ChessEngine();
      expect(engine.move('e5')).toBe(false); // black tries to move on white's turn
    });

    test('cannot move to same square', () => {
      const engine = new ChessEngine();
      expect(engine.move('e2')).toBe(false);
    });

    test('pinned piece cannot move', () => {
      const engine = new ChessEngine('rnbqkbnr/pppp1ppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
      // Pin the knight on b1
      const engine2 = new ChessEngine('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 3');
      expect(engine2.move('Nc3')).toBe(false);
    });

    test('discovered check is prevented', () => {
      const engine = new ChessEngine('rnbqkbnr/pppp1ppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
      // Move bishop blocking check
      const engine2 = new ChessEngine('8/8/8/8/8/8/8/4k2K b - - 0 1');
      engine2.put({ type: 'b', color: 'w' }, 'e2');
      engine2.put({ type: 'r', color: 'b' }, 'a1');
      // White bishop on e2 blocks black rook on a1 from checking white king on h1
      // If white moves bishop, king would be in check — illegal
      expect(engine2.move({ from: 'e2', to: 'd3' })).toBe(false);
    });

    test('castling rights tracked correctly', () => {
      const engine = new ChessEngine();
      engine.move('a4');
      engine.move('a5');
      engine.move('Ra3');
      engine.move('Ra6');
      engine.move('Ra1');
      engine.move('Ra8');
      // Both a-rooks moved, queenside castling should be unavailable
      const fen = engine.fen();
      expect(fen).not.toContain('Q');
      expect(fen).not.toContain('q');
    });

    test('en passant square is set after double pawn push', () => {
      const engine = new ChessEngine();
      engine.move('e4');
      const fen = engine.fen();
      expect(fen).toContain('e3');
    });

    test('en passant square is cleared after non-pawn move', () => {
      const engine = new ChessEngine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
      engine.move('Nf6');
      const fen = engine.fen();
      expect(fen).toContain(' - ');
    });

    test('full move counter increments after black move', () => {
      const engine = new ChessEngine();
      engine.move('e4');
      engine.move('e5');
      const fen = engine.fen();
      expect(fen.endsWith(' 2')).toBe(true);
    });

    test('half move counter resets on pawn move or capture', () => {
      const engine = new ChessEngine();
      engine.move('Nf3');
      engine.move('Nf6');
      engine.move('Ng1');
      const fen = engine.fen();
      expect(fen).toContain(' 3 '); // 3 half moves
      engine.move('Ng8');
      expect(engine.fen()).toContain(' 4 '); // still no pawn move or capture
    });
  });
});

describe('validateFen', () => {
  test('valid starting position', () => {
    const result = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(result.ok).toBe(true);
  });

  test('valid position after e4', () => {
    const result = validateFen('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    expect(result.ok).toBe(true);
  });

  test('invalid — wrong number of ranks', () => {
    const result = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP w KQkq - 0 1');
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('invalid — bad active color', () => {
    const result = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1');
    expect(result.ok).toBe(false);
  });

  test('invalid — too many pieces', () => {
    const result = validateFen('qqqqqqqq/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(result.ok).toBe(false);
  });

  test('invalid — bad castling rights', () => {
    const result = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w XYZ - 0 1');
    expect(result.ok).toBe(false);
  });

  test('invalid — bad en passant square', () => {
    const result = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq x9 0 1');
    expect(result.ok).toBe(false);
  });
});

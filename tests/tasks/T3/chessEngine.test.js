import { ChessEngine, validateFen } from '../../../dist/chess.js';

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    results.push(`PASS: ${name}`);
  } catch (err) {
    failed++;
    const msg = (err && err.message) ? err.message.split('\n')[0] : String(err);
    results.push(`FAIL: ${name} | ${msg}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTrue(value, message) {
  if (value !== true) {
    throw new Error(message || `Expected true, got ${JSON.stringify(value)}`);
  }
}

function assertFalse(value, message) {
  if (value !== false) {
    throw new Error(message || `Expected false, got ${JSON.stringify(value)}`);
  }
}

function assertDeepEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message || 'Deep equal failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(message || `Expected non-null value, got ${JSON.stringify(value)}`);
  }
}

function assertNull(value, message) {
  if (value !== null && value !== undefined) {
    throw new Error(message || `Expected null, got ${JSON.stringify(value)}`);
  }
}

// ─────────────────────────────────────────────
// 1. Board Representation & Initialization
// ─────────────────────────────────────────────

test('default constructor creates starting position', () => {
  const engine = new ChessEngine();
  assertNotNull(engine.get('e2'), 'e2 should have a piece');
  assertEqual(engine.get('e2').type, 'p', 'e2 should be a white pawn');
  assertEqual(engine.get('e2').color, 'w', 'e2 should be white');
  assertNotNull(engine.get('e7'), 'e7 should have a piece');
  assertEqual(engine.get('e7').type, 'p', 'e7 should be a black pawn');
  assertEqual(engine.get('e7').color, 'b', 'e7 should be black');
});

test('getBoard returns 8x8 array', () => {
  const engine = new ChessEngine();
  const board = engine.getBoard();
  assertEqual(board.length, 8, 'board should have 8 ranks');
  for (let i = 0; i < 8; i++) {
    assertEqual(board[i].length, 8, `rank ${i} should have 8 files`);
  }
});

test('board has correct starting pieces', () => {
  const engine = new ChessEngine();
  assertEqual(engine.get('a1').type, 'r');
  assertEqual(engine.get('b1').type, 'n');
  assertEqual(engine.get('c1').type, 'b');
  assertEqual(engine.get('d1').type, 'q');
  assertEqual(engine.get('e1').type, 'k');
  assertEqual(engine.get('f1').type, 'b');
  assertEqual(engine.get('g1').type, 'n');
  assertEqual(engine.get('h1').type, 'r');
  assertEqual(engine.get('a8').type, 'r');
  assertEqual(engine.get('a8').color, 'b');
  assertEqual(engine.get('e8').type, 'k');
  assertEqual(engine.get('e8').color, 'b');
});

test('empty squares return null', () => {
  const engine = new ChessEngine();
  assertNull(engine.get('e3'), 'e3 should be empty');
  assertNull(engine.get('e6'), 'e6 should be empty');
});

test('clear removes all pieces', () => {
  const engine = new ChessEngine();
  engine.clear();
  for (let file = 0; file < 8; file++) {
    for (let rank = 0; rank < 8; rank++) {
      const sq = String.fromCharCode(97 + file) + (8 - rank);
      assertNull(engine.get(sq), `${sq} should be empty after clear`);
    }
  }
});

test('reset restores starting position after clear', () => {
  const engine = new ChessEngine();
  engine.clear();
  engine.reset();
  assertNotNull(engine.get('e2'), 'e2 should have piece after reset');
  assertEqual(engine.get('e2').type, 'p');
  assertEqual(engine.get('e2').color, 'w');
});

test('put places a piece on a square', () => {
  const engine = new ChessEngine();
  engine.clear();
  engine.put({ type: 'q', color: 'w' }, 'd4');
  assertEqual(engine.get('d4').type, 'q');
  assertEqual(engine.get('d4').color, 'w');
});

test('remove returns and removes a piece', () => {
  const engine = new ChessEngine();
  const removed = engine.remove('e2');
  assertNotNull(removed, 'remove should return the piece');
  assertEqual(removed.type, 'p');
  assertNull(engine.get('e2'), 'e2 should be empty after removal');
});

test('remove from empty square returns null', () => {
  const engine = new ChessEngine();
  assertNull(engine.remove('e4'), 'removing from empty square returns null');
});

// ─────────────────────────────────────────────
// 2. Turn Management
// ─────────────────────────────────────────────

test('turn starts as white', () => {
  const engine = new ChessEngine();
  assertEqual(engine.turn(), 'w', 'turn should start as white');
});

test('turn alternates after a move', () => {
  const engine = new ChessEngine();
  engine.move('e4');
  assertEqual(engine.turn(), 'b', 'turn should be black after white moves');
  engine.move('e5');
  assertEqual(engine.turn(), 'w', 'turn should be white after black moves');
});

// ─────────────────────────────────────────────
// 3. Move Validation — Basic Pieces
// ─────────────────────────────────────────────

test('white pawn can move forward one square', () => {
  const engine = new ChessEngine();
  assertTrue(engine.move({ from: 'e2', to: 'e3' }), 'e2-e3 should be legal');
});

test('white pawn can move forward two squares from starting rank', () => {
  const engine = new ChessEngine();
  assertTrue(engine.move({ from: 'e2', to: 'e4' }), 'e2-e4 should be legal');
});

test('white pawn cannot move forward two squares after first move', () => {
  const engine = new ChessEngine();
  engine.move('e4');
  engine.move('e5');
  assertFalse(engine.move({ from: 'e4', to: 'e6' }), 'e4-e6 should be illegal');
});

test('pawn cannot move forward into occupied square', () => {
  const engine = new ChessEngine();
  assertFalse(engine.move({ from: 'e2', to: 'e1' }), 'e2-e1 should be illegal');
});

test('pawn captures diagonally', () => {
  const engine = new ChessEngine();
  engine.load('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2');
  assertTrue(engine.move({ from: 'e4', to: 'd5' }), 'e4xd5 should be legal');
});

test('rook moves horizontally', () => {
  const engine = new ChessEngine();
  engine.load('8/8/8/8/3R4/8/8/8 w - - 0 1');
  assertTrue(engine.move({ from: 'd4', to: 'h4' }), 'rook should move horizontally');
});

test('rook moves vertically', () => {
  const engine = new ChessEngine();
  engine.load('8/8/8/8/3R4/8/8/8 w - - 0 1');
  assertTrue(engine.move({ from: 'd4', to: 'd8' }), 'rook should move vertically');
});

test('rook cannot jump over pieces', () => {
  const engine = new ChessEngine();
  engine.load('8/8/3p4/8/3R4/8/8/8 w - - 0 1');
  assertFalse(engine.move({ from: 'd4', to: 'd8' }), 'rook should not jump over pieces');
});

test('knight moves in L-shape', () => {
  const engine = new ChessEngine();
  engine.load('8/8/8/8/3N4/8/8/8 w - - 0 1');
  assertTrue(engine.move({ from: 'd4', to: 'f5' }), 'knight N-shape move should be legal');
  assertTrue(engine.move({ from: 'f5', to: 'e7' }), 'knight another L-shape should be legal');
});

test('knight can jump over pieces', () => {
  const engine = new ChessEngine();
  engine.load('8/8/3p4/3p4/3N4/3p4/8/8 w - - 0 1');
  assertTrue(engine.move({ from: 'd4', to: 'f5' }), 'knight should jump over pieces');
});

test('bishop moves diagonally', () => {
  const engine = new ChessEngine();
  engine.load('8/8/8/8/3B4/8/8/8 w - - 0 1');
  assertTrue(engine.move({ from: 'd4', to: 'g7' }), 'bishop should move diagonally');
});

test('bishop cannot change color', () => {
  const engine = new ChessEngine();
  engine.load('8/8/8/8/3B4/8/8/8 w - - 0 1');
  assertFalse(engine.move({ from: 'd4', to: 'd5' }), 'bishop should not move straight');
});

test('queen moves like rook and bishop', () => {
  const engine = new ChessEngine();
  engine.load('8/8/8/8/3Q4/8/8/8 w - - 0 1');
  assertTrue(engine.move({ from: 'd4', to: 'd8' }), 'queen should move vertically');
  engine.load('8/8/8/8/3Q4/8/8/8 w - - 0 1');
  assertTrue(engine.move({ from: 'd4', to: 'h8' }), 'queen should move diagonally');
});

test('king moves one square in any direction', () => {
  const engine = new ChessEngine();
  engine.load('8/8/8/8/3K4/8/8/8 w - - 0 1');
  assertTrue(engine.move({ from: 'd4', to: 'd5' }), 'king should move one square');
  engine.load('8/8/8/8/3K4/8/8/8 w - - 0 1');
  assertTrue(engine.move({ from: 'd4', to: 'e5' }), 'king should move one square diagonally');
});

test('king cannot move more than one square', () => {
  const engine = new ChessEngine();
  engine.load('8/8/8/8/3K4/8/8/8 w - - 0 1');
  assertFalse(engine.move({ from: 'd4', to: 'd6' }), 'king should not move two squares');
});

test('cannot move into check', () => {
  const engine = new ChessEngine();
  engine.load('8/8/8/4r3/3K4/8/8/8 w - - 0 1');
  assertFalse(engine.move({ from: 'd4', to: 'd5' }), 'king should not move into check');
});

test('cannot move own piece to reveal check on king', () => {
  const engine = new ChessEngine();
  engine.load('8/8/8/4r3/3K1P2/8/8/8 w - - 0 1');
  assertFalse(engine.move({ from: 'f4', to: 'f5' }), 'should not reveal check on king');
});

// ─────────────────────────────────────────────
// 4. Special Moves
// ─────────────────────────────────────────────

test('kingside castling is legal when rights exist and path is clear', () => {
  const engine = new ChessEngine();
  engine.load('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
  assertTrue(engine.move('O-O'), 'kingside castling should be legal');
  assertEqual(engine.get('g1').type, 'k', 'king should be on g1');
  assertEqual(engine.get('f1').type, 'r', 'rook should be on f1');
});

test('queenside castling is legal when rights exist and path is clear', () => {
  const engine = new ChessEngine();
  engine.load('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
  assertTrue(engine.move('O-O-O'), 'queenside castling should be legal');
  assertEqual(engine.get('c1').type, 'k', 'king should be on c1');
  assertEqual(engine.get('d1').type, 'r', 'rook should be on d1');
});

test('castling is illegal when king is in check', () => {
  const engine = new ChessEngine();
  engine.load('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K1QR w KQkq - 0 1');
  assertFalse(engine.move('O-O'), 'castling should be illegal when in check');
});

test('castling is illegal when path is under attack', () => {
  const engine = new ChessEngine();
  engine.load('r3k2r/pppppppp/8/8/8/5B2/PPPPPPPP/R3K2R b KQkq - 0 1');
  assertFalse(engine.move('O-O'), 'castling should be illegal through attacked square');
});

test('castling rights are lost after king moves', () => {
  const engine = new ChessEngine();
  engine.load('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
  engine.move('e1'); // some move
  engine.move('a7');
  engine.move('Ke2');
  engine.move('a6');
  assertFalse(engine.move('O-O'), 'castling should be illegal after king moved');
});

test('en passant capture is legal immediately after double pawn push', () => {
  const engine = new ChessEngine();
  engine.load('rnbqkbnr/pppp1ppp/8/4pP2/8/8/PPPPP1PP/RNBQKBNR w KQkq e6 0 3');
  assertTrue(engine.move({ from: 'f5', to: 'e6' }), 'en passant should be legal');
  assertNull(engine.get('e5'), 'captured pawn should be removed from e5');
});

test('en passant is only legal on the immediate next move', () => {
  const engine = new ChessEngine();
  engine.load('rnbqkbnr/pppp1ppp/8/4pP2/8/8/PPPPP1PP/RNBQKBNR w KQkq e6 0 3');
  engine.move('a3');
  engine.move('a6');
  assertFalse(engine.move({ from: 'f5', to: 'e6' }), 'en passant should not be legal after one move passed');
});

test('pawn promotion to queen', () => {
  const engine = new ChessEngine();
  engine.load('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
  assertTrue(engine.move({ from: 'e7', to: 'e8', promotion: 'q' }), 'promotion to queen should be legal');
  assertEqual(engine.get('e8').type, 'q', 'promoted piece should be queen');
});

test('pawn promotion to knight', () => {
  const engine = new ChessEngine();
  engine.load('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
  assertTrue(engine.move({ from: 'e7', to: 'e8', promotion: 'n' }), 'promotion to knight should be legal');
  assertEqual(engine.get('e8').type, 'n', 'promoted piece should be knight');
});

test('pawn promotion defaults to queen when not specified', () => {
  const engine = new ChessEngine();
  engine.load('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
  assertTrue(engine.move({ from: 'e7', to: 'e8' }), 'promotion should default to queen');
  assertEqual(engine.get('e8').type, 'q', 'promoted piece should default to queen');
});

// ─────────────────────────────────────────────
// 5. Check / Checkmate / Stalemate Detection
// ─────────────────────────────────────────────

test('inCheck returns true when king is attacked', () => {
  const engine = new ChessEngine();
  engine.load('4k3/8/8/8/8/8/4R3/4K3 b - - 0 1');
  assertTrue(engine.inCheck(), 'black king should be in check');
});

test('inCheck returns false when king is safe', () => {
  const engine = new ChessEngine();
  engine.load('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
  assertFalse(engine.inCheck(), 'king should not be in check');
});

test('isCheckmate returns true in fool\'s mate position', () => {
  const engine = new ChessEngine();
  engine.load('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 3');
  assertTrue(engine.isCheckmate(), 'should be checkmate (fool\'s mate)');
});

test('isCheckmate returns false when king can escape', () => {
  const engine = new ChessEngine();
  engine.load('4k3/8/8/8/8/8/4R3/4K3 b - - 0 1');
  assertFalse(engine.isCheckmate(), 'should not be checkmate — king can move');
});

test('isStalemate returns true in basic stalemate', () => {
  const engine = new ChessEngine();
  engine.load('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
  assertTrue(engine.isStalemate(), 'should be stalemate');
});

test('isStalemate returns false when moves are available', () => {
  const engine = new ChessEngine();
  engine.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  assertFalse(engine.isStalemate(), 'starting position is not stalemate');
});

test('result returns checkmate when applicable', () => {
  const engine = new ChessEngine();
  engine.load('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 3');
  assertEqual(engine.result(), 'checkmate', 'result should be checkmate');
});

test('result returns stalemate when applicable', () => {
  const engine = new ChessEngine();
  engine.load('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
  assertEqual(engine.result(), 'stalemate', 'result should be stalemate');
});

test('result returns ongoing during normal play', () => {
  const engine = new ChessEngine();
  assertEqual(engine.result(), 'ongoing', 'starting position should be ongoing');
});

// ─────────────────────────────────────────────
// 6. Move Generation
// ─────────────────────────────────────────────

test('moves returns 20 legal moves at starting position for white', () => {
  const engine = new ChessEngine();
  const legalMoves = engine.moves();
  assertEqual(legalMoves.length, 20, 'white should have 20 legal moves from start');
});

test('moves filtering by square', () => {
  const engine = new ChessEngine();
  const e2Moves = engine.moves({ square: 'e2' });
  assertEqual(e2Moves.length, 2, 'e2 pawn should have 2 moves');
});

test('moves returns SAN strings by default', () => {
  const engine = new ChessEngine();
  const moves = engine.moves();
  assertTrue(typeof moves[0] === 'string', 'default moves should return SAN strings');
});

test('moves returns Move objects when verbose', () => {
  const engine = new ChessEngine();
  const moves = engine.moves({ verbose: true });
  assertTrue(typeof moves[0] === 'object', 'verbose moves should return objects');
  assertNotNull(moves[0].from, 'move object should have from');
  assertNotNull(moves[0].to, 'move object should have to');
});

test('isLegal returns true for legal move', () => {
  const engine = new ChessEngine();
  assertTrue(engine.isLegal({ from: 'e2', to: 'e4' }), 'e2-e4 should be legal');
});

test('isLegal returns false for illegal move', () => {
  const engine = new ChessEngine();
  assertFalse(engine.isLegal({ from: 'e2', to: 'e5' }), 'e2-e5 should be illegal');
});

// ─────────────────────────────────────────────
// 7. FEN Import / Export
// ─────────────────────────────────────────────

test('fen exports starting position correctly', () => {
  const engine = new ChessEngine();
  const fen = engine.fen();
  assertEqual(fen, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'starting FEN should be correct');
});

test('load imports FEN and sets correct position', () => {
  const engine = new ChessEngine();
  const ok = engine.load('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
  assertTrue(ok, 'load should return true for valid FEN');
  assertEqual(engine.get('e4').type, 'P', 'e4 should have white pawn');
  assertEqual(engine.turn(), 'b', 'should be black to move');
});

test('load returns false for invalid FEN', () => {
  const engine = new ChessEngine();
  const ok = engine.load('invalid');
  assertFalse(ok, 'load should return false for invalid FEN');
});

test('fen reflects changes after moves', () => {
  const engine = new ChessEngine();
  engine.move('e4');
  const fen = engine.fen();
  assertTrue(fen.startsWith('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b'), 'FEN should reflect e4 move');
});

test('validateFen returns ok for valid starting FEN', () => {
  const result = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  assertTrue(result.ok, 'starting FEN should be valid');
});

test('validateFen returns error for invalid FEN', () => {
  const result = validateFen('invalid-fen');
  assertFalse(result.ok, 'invalid FEN should fail validation');
  assertNotNull(result.error, 'error message should be present');
});

test('validateFen detects wrong number of ranks', () => {
  const result = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP w KQkq - 0 1');
  assertFalse(result.ok, 'FEN with missing rank should be invalid');
});

test('constructor accepts FEN string', () => {
  const engine = new ChessEngine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
  assertEqual(engine.get('e4').type, 'P');
  assertEqual(engine.turn(), 'b');
});

// ─────────────────────────────────────────────
// 8. Move History & Undo
// ─────────────────────────────────────────────

test('historyMoves is empty at start', () => {
  const engine = new ChessEngine();
  assertEqual(engine.historyMoves().length, 0, 'history should be empty at start');
});

test('historyMoves tracks moves', () => {
  const engine = new ChessEngine();
  engine.move('e4');
  engine.move('e5');
  const history = engine.historyMoves();
  assertEqual(history.length, 2, 'history should have 2 moves');
  assertEqual(history[0].from, 'e2', 'first move from e2');
  assertEqual(history[0].to, 'e4', 'first move to e4');
});

test('undo reverts the last move', () => {
  const engine = new ChessEngine();
  engine.move('e4');
  const undone = engine.undo();
  assertNotNull(undone, 'undo should return the undone move');
  assertEqual(undone.from, 'e2');
  assertEqual(undone.to, 'e4');
  assertNotNull(engine.get('e2'), 'e2 pawn should be restored');
  assertNull(engine.get('e4'), 'e4 should be empty');
});

test('undo returns null when no moves to undo', () => {
  const engine = new ChessEngine();
  assertNull(engine.undo(), 'undo should return null with no history');
});

test('undo restores turn', () => {
  const engine = new ChessEngine();
  engine.move('e4');
  assertEqual(engine.turn(), 'b', 'turn should be black after e4');
  engine.undo();
  assertEqual(engine.turn(), 'w', 'turn should be white after undo');
});

test('move returns false for illegal move', () => {
  const engine = new ChessEngine();
  assertFalse(engine.move({ from: 'e2', to: 'e5' }), 'illegal move should return false');
});

test('move returns true for legal move', () => {
  const engine = new ChessEngine();
  assertTrue(engine.move({ from: 'e2', to: 'e4' }), 'legal move should return true');
});

// ─────────────────────────────────────────────
// 9. PGN Export
// ─────────────────────────────────────────────

test('pgn exports empty game', () => {
  const engine = new ChessEngine();
  const pgn = engine.pgn();
  assertTrue(pgn.includes('[Event "?"]'), 'PGN should include default Event header');
  assertTrue(pgn.includes('[Result "*"]'), 'PGN should include Result header');
});

test('pgn exports game with moves', () => {
  const engine = new ChessEngine();
  engine.move('e4');
  engine.move('e5');
  engine.move('Nf3');
  const pgn = engine.pgn();
  assertTrue(pgn.includes('1. e4 e5 2. Nf3'), 'PGN should contain move notation');
});

test('pgn includes custom headers', () => {
  const engine = new ChessEngine();
  const pgn = engine.pgn({ headers: { Event: 'Test Game', White: 'Alice', Black: 'Bob' } });
  assertTrue(pgn.includes('[Event "Test Game"]'), 'PGN should include custom Event');
  assertTrue(pgn.includes('[White "Alice"]'), 'PGN should include White header');
  assertTrue(pgn.includes('[Black "Bob"]'), 'PGN should include Black header');
});

test('pgn includes checkmate result', () => {
  const engine = new ChessEngine();
  engine.load('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 3');
  const pgn = engine.pgn();
  assertTrue(pgn.includes('[Result "0-1"]'), 'PGN should include checkmate result');
});

test('loadPgn parses a simple PGN game', () => {
  const engine = new ChessEngine();
  const pgn = `[Event "Test"]\n1. e4 e5 2. Nf3 Nc6 *`;
  const ok = engine.loadPgn(pgn);
  assertTrue(ok, 'loadPgn should return true for valid PGN');
  assertEqual(engine.turn(), 'w', 'after even number of moves, white to move');
});

test('loadPgn returns false for invalid PGN', () => {
  const engine = new ChessEngine();
  const ok = engine.loadPgn('not a pgn at all');
  assertFalse(ok, 'loadPgn should return false for invalid PGN');
});

// ─────────────────────────────────────────────
// 10. Edge Cases — Draw Conditions
// ─────────────────────────────────────────────

test('isDraw returns true for stalemate', () => {
  const engine = new ChessEngine();
  engine.load('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
  assertTrue(engine.isDraw(), 'stalemate should be a draw');
});

test('result returns draw for stalemate', () => {
  const engine = new ChessEngine();
  engine.load('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
  assertEqual(engine.result(), 'draw', 'stalemate result should be draw');
});

test('insufficient material: king vs king', () => {
  const engine = new ChessEngine();
  engine.load('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
  assertTrue(engine.isDraw(), 'king vs king should be drawn by insufficient material');
  assertEqual(engine.result(), 'insufficient', 'result should be insufficient');
});

test('insufficient material: king and bishop vs king', () => {
  const engine = new ChessEngine();
  engine.load('4k3/8/8/8/8/8/5B2/4K3 w - - 0 1');
  assertTrue(engine.isDraw(), 'KB vs K should be insufficient material');
});

test('insufficient material: king and knight vs king', () => {
  const engine = new ChessEngine();
  engine.load('4k3/8/8/8/8/8/5N2/4K3 w - - 0 1');
  assertTrue(engine.isDraw(), 'KN vs K should be insufficient material');
});

test('sufficient material: king and pawn vs king', () => {
  const engine = new ChessEngine();
  engine.load('4k3/8/8/8/8/8/4P3/4K3 w - - 0 1');
  assertFalse(engine.isDraw(), 'KP vs K should NOT be insufficient material');
});

test('threefold repetition is detected', () => {
  const engine = new ChessEngine();
  // Move pieces back and forth to repeat position
  engine.move('Nf3');
  engine.move('Nf6');
  engine.move('Ng1');
  engine.move('Ng8');
  engine.move('Nf3');
  engine.move('Nf6');
  engine.move('Ng1');
  engine.move('Ng8');
  assertTrue(engine.isDraw(), 'threefold repetition should be a draw');
  assertEqual(engine.result(), 'repetition', 'result should be repetition');
});

test('50-move rule is detected', () => {
  const engine = new ChessEngine();
  engine.load('4k3/8/8/8/8/8/8/4K3 w - - 100 1');
  assertTrue(engine.isDraw(), '50-move rule should be a draw');
  assertEqual(engine.result(), 'fifty-move', 'result should be fifty-move');
});

test('halfMove counter increments on non-pawn non-capture moves', () => {
  const engine = new ChessEngine();
  engine.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 10 1');
  engine.move('Nf3');
  const fen = engine.fen();
  assertTrue(fen.includes('11'), 'halfMove should be 11 after non-pawn non-capture');
});

test('halfMove counter resets on pawn move', () => {
  const engine = new ChessEngine();
  engine.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 10 1');
  engine.move('e4');
  const fen = engine.fen();
  assertTrue(fen.includes(' - 0 '), 'halfMove should reset to 0 after pawn move');
});

test('fullMove counter increments after black move', () => {
  const engine = new ChessEngine();
  engine.move('e4');
  engine.move('e5');
  const fen = engine.fen();
  assertTrue(fen.endsWith('2'), 'fullMove should be 2 after black moves');
});

// ─────────────────────────────────────────────
// 11. SAN Notation
// ─────────────────────────────────────────────

test('move accepts SAN string e4', () => {
  const engine = new ChessEngine();
  assertTrue(engine.move('e4'), 'SAN "e4" should be accepted');
});

test('move accepts SAN Nf3', () => {
  const engine = new ChessEngine();
  assertTrue(engine.move('Nf3'), 'SAN "Nf3" should be accepted');
});

test('move accepts SAN O-O for kingside castling', () => {
  const engine = new ChessEngine();
  engine.load('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
  assertTrue(engine.move('O-O'), 'SAN "O-O" should work for kingside castling');
});

test('move accepts SAN O-O-O for queenside castling', () => {
  const engine = new ChessEngine();
  engine.load('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
  assertTrue(engine.move('O-O-O'), 'SAN "O-O-O" should work for queenside castling');
});

test('move returns false for invalid SAN', () => {
  const engine = new ChessEngine();
  assertFalse(engine.move('e9'), 'invalid SAN should return false');
});

// ─────────────────────────────────────────────
// 12. Complex Scenarios
// ─────────────────────────────────────────────

test('scholars mate position is checkmate', () => {
  const engine = new ChessEngine();
  engine.load('r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4');
  assertTrue(engine.isCheckmate(), 'scholars mate should be checkmate');
});

test('castling rights are reflected in FEN', () => {
  const engine = new ChessEngine();
  engine.load('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
  engine.move('e4');
  engine.move('e5');
  const fen = engine.fen();
  assertTrue(fen.includes('KQkq'), 'all castling rights should still be present');
});

test('en passant square is reflected in FEN', () => {
  const engine = new ChessEngine();
  engine.move('e4');
  const fen = engine.fen();
  assertTrue(fen.includes('e3'), 'en passant target should be e3 after e2-e4');
});

test('move captures piece and updates board', () => {
  const engine = new ChessEngine();
  engine.load('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2');
  engine.move('exd5');
  assertEqual(engine.get('d5').type, 'p');
  assertEqual(engine.get('d5').color, 'w');
  assertNull(engine.get('e4'), 'e4 should be empty after capture');
});

test('multiple undo restores full game state', () => {
  const engine = new ChessEngine();
  engine.move('e4');
  engine.move('e5');
  engine.move('Nf3');
  engine.undo();
  engine.undo();
  engine.undo();
  assertEqual(engine.fen(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'full undo should restore starting position');
});

// ─────────────────────────────────────────────
// Print results
// ─────────────────────────────────────────────

console.log('===FABRIC_TEST_RESULTS===');
results.forEach(r => console.log(r));
console.log('===END_TEST_RESULTS===');
console.log(`tests passed ${passed} out of ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
}

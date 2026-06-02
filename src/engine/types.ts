export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type Color = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: Color;
}

export type Square = string; // algebraic notation, e.g. 'e2', 'e4'

export interface Move {
  from: Square;
  to: Square;
  piece: Piece;
  captured?: Piece;
  promotion?: PieceType;
  flags: string; // e.g. 'n' = normal, 'c' = capture, 'e' = en passant, 'p' = promotion, 'k' = kingside castle, 'q' = queenside castle
  san?: string; // Standard Algebraic Notation
}

export interface GameState {
  board: (Piece | null)[][];
  turn: Color;
  castling: {
    w: { kingSide: boolean; queenSide: boolean };
    b: { kingSide: boolean; queenSide: boolean };
  };
  enPassant: Square | null;
  halfMoves: number;
  fullMoves: number;
}

export type GameResult = 'ongoing' | 'checkmate' | 'stalemate' | 'draw' | 'insufficient' | 'repetition' | 'fifty-move';

export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface CastlingRights {
  w: { kingSide: boolean; queenSide: boolean };
  b: { kingSide: boolean; queenSide: boolean };
}

export interface Game {
  state: GameState;
  history: Move[];
}

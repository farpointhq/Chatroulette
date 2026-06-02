export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export interface Square {
  file: number; // 0-7 (a-h)
  rank: number; // 0-7 (1-8)
}

export interface Move {
  from: string; // algebraic notation e.g. "e2"
  to: string;   // algebraic notation e.g. "e4"
  promotion?: PieceType;
}

export interface BoardSquare {
  square: string; // algebraic notation e.g. "e2"
  piece?: ChessPiece;
}

export interface ChessBoardProps {
  fen: string;
  orientation?: PieceColor;
  onMove?: (move: Move) => void;
  legalMoves?: string[]; // list of destination squares (algebraic) for selected piece
  lastMove?: Move | null;
  inCheck?: boolean;
  checkmate?: boolean;
  onPromotion?: (piece: PieceType) => void;
  promotionSquare?: string | null;
}

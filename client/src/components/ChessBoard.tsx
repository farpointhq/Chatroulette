import React from 'react';
import type { ChessBoardProps, ChessPiece } from '../types/chess';

// SVG chess piece components
const PieceSvg: React.FC<{ piece: ChessPiece }> = ({ piece }) => {
  const color = piece.color === 'w' ? 'white' : 'black';
  const stroke = piece.color === 'w' ? 'black' : 'white';

  const pieces: Record<string, React.ReactNode> = {
    'wp': <text fill={color} stroke={stroke} strokeWidth="0.5" fontSize="45" textAnchor="middle" dominantBaseline="central">♙</text>,
    'wn': <text fill={color} stroke={stroke} strokeWidth="0.5" fontSize="45" textAnchor="middle" dominantBaseline="central">♘</text>,
    'wb': <text fill={color} stroke={stroke} strokeWidth="0.5" fontSize="45" textAnchor="middle" dominantBaseline="central">♗</text>,
    'wr': <text fill={color} stroke={stroke} strokeWidth="0.5" fontSize="45" textAnchor="middle" dominantBaseline="central">♖</text>,
    'wq': <text fill={color} stroke={stroke} strokeWidth="0.5" fontSize="45" textAnchor="middle" dominantBaseline="central">♕</text>,
    'wk': <text fill={color} stroke={stroke} strokeWidth="0.5" fontSize="45" textAnchor="middle" dominantBaseline="central">♔</text>,
    'bp': <text fill={color} stroke={stroke} strokeWidth="0.5" fontSize="45" textAnchor="middle" dominantBaseline="central">♟</text>,
    'bn': <text fill={color} stroke={stroke} strokeWidth="0.5" fontSize="45" textAnchor="middle" dominantBaseline="central">♞</text>,
    'bb': <text fill={color} stroke={stroke} strokeWidth="0.5" fontSize="45" textAnchor="middle" dominantBaseline="central">♝</text>,
    'br': <text fill={color} stroke={stroke} strokeWidth="0.5" fontSize="45" textAnchor="middle" dominantBaseline="central">♜</text>,
    'bq': <text fill={color} stroke={stroke} strokeWidth="0.5" fontSize="45" textAnchor="middle" dominantBaseline="central">♛</text>,
    'bk': <text fill={color} stroke={stroke} strokeWidth="0.5" fontSize="45" textAnchor="middle" dominantBaseline="central">♚</text>,
  };

  return <>{pieces[`${piece.color}${piece.type}`]}</>;
};

// Parse FEN string to get piece placement
export function parseFEN(fen: string): (ChessPiece | null)[][] {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  const placement = fen.split(' ')[0];
  const rows = placement.split('/');

  for (let rank = 0; rank < 8; rank++) {
    let file = 0;
    for (const char of rows[rank]) {
      if (/\d/.test(char)) {
        file += parseInt(char, 10);
      } else {
        const color: 'w' | 'b' = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toLowerCase() as ChessPiece['type'];
        board[rank][file] = { type, color };
        file++;
      }
    }
  }

  return board;
}

// Convert file/rank to algebraic notation
export function toAlgebraic(file: number, rank: number): string {
  return `${String.fromCharCode(97 + file)}${8 - rank}`;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  orientation = 'w',
  onMove,
  legalMoves = [],
  lastMove = null,
  inCheck = false,
  checkmate = false,
  onPromotion,
  promotionSquare = null,
}) => {
  const [selectedSquare, setSelectedSquare] = React.useState<string | null>(null);
  const [draggingPiece, setDraggingPiece] = React.useState<string | null>(null);

  const board = parseFEN(fen);

  const handleSquareClick = (square: string, piece: ChessPiece | null) => {
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }
      // If clicking a legal destination, make the move
      if (legalMoves.includes(square)) {
        onMove?.({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        return;
      }
      // If clicking another piece, select it instead
      if (piece) {
        setSelectedSquare(square);
        return;
      }
      setSelectedSquare(null);
    } else {
      if (piece) {
        setSelectedSquare(square);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, square: string) => {
    setDraggingPiece(square);
    setSelectedSquare(square);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toSquare: string) => {
    e.preventDefault();
    if (draggingPiece && draggingPiece !== toSquare) {
      onMove?.({ from: draggingPiece, to: toSquare });
    }
    setDraggingPiece(null);
    setSelectedSquare(null);
  };

  const isLightSquare = (file: number, rank: number) => (file + rank) % 2 === 0;

  const getRankOrder = () => {
    if (orientation === 'w') {
      return [0, 1, 2, 3, 4, 5, 6, 7];
    }
    return [7, 6, 5, 4, 3, 2, 1, 0];
  };

  const getFileOrder = () => {
    if (orientation === 'w') {
      return [0, 1, 2, 3, 4, 5, 6, 7];
    }
    return [7, 6, 5, 4, 3, 2, 1, 0];
  };

  const renderPromotionDialog = () => {
    if (!promotionSquare || !onPromotion) return null;

    const pieces: Array<{ type: 'q' | 'r' | 'b' | 'n'; label: string }> = [
      { type: 'q', label: '♕' },
      { type: 'r', label: '♖' },
      { type: 'b', label: '♗' },
      { type: 'n', label: '♘' },
    ];

    return (
      <div data-testid="promotion-dialog" className="promotion-dialog" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        border: '2px solid black',
        padding: '10px',
        zIndex: 100,
        display: 'flex',
        gap: '5px',
      }}>
        {pieces.map(p => (
          <button
            key={p.type}
            data-testid={`promote-${p.type}`}
            onClick={() => onPromotion(p.type)}
            style={{ fontSize: '30px', cursor: 'pointer' }}
          >
            {p.label}
          </button>
        ))}
      </div>
    );
  };

  const ranks = getRankOrder();
  const files = getFileOrder();

  return (
    <div data-testid="chess-board" style={{ position: 'relative' }}>
      {renderPromotionDialog()}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gridTemplateRows: 'repeat(8, 1fr)',
        width: '100%',
        maxWidth: '500px',
        aspectRatio: '1',
        border: '2px solid #333',
      }}>
        {ranks.map(rank =>
          files.map(file => {
            const square = toAlgebraic(file, rank);
            const piece = board[rank][file];
            const isSelected = selectedSquare === square;
            const isLegalMove = selectedSquare && legalMoves.includes(square);
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
            const isCheckSquare = inCheck && piece?.type === 'k' && piece?.color === 'w'; // simplified: white king in check

            let backgroundColor = isLightSquare(file, rank) ? '#f0d9b5' : '#b58863';
            if (isSelected) backgroundColor = '#bbcb2b';
            if (isLastMove) backgroundColor = '#f7ec5e';
            if (isCheckSquare) backgroundColor = '#ff6b6b';

            return (
              <div
                key={square}
                data-testid={`square-${square}`}
                data-square={square}
                onClick={() => handleSquareClick(square, piece)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, square)}
                style={{
                  backgroundColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: piece ? 'grab' : 'default',
                }}
              >
                {isLegalMove && !piece && (
                  <div data-testid={`legal-move-${square}`} style={{
                    width: '30%',
                    height: '30%',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  }} />
                )}
                {isLegalMove && piece && (
                  <div data-testid={`legal-capture-${square}`} style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '4px solid rgba(0, 0, 0, 0.3)',
                  }} />
                )}
                {piece && (
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, square)}
                    data-testid={`piece-${square}`}
                    data-piece-type={piece.type}
                    data-piece-color={piece.color}
                    style={{ width: '80%', height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <PieceSvg piece={piece} />
                  </div>
                )}
                {/* Coordinate labels */}
                {file === (orientation === 'w' ? 0 : 7) && (
                  <span style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '10px', color: isLightSquare(file, rank) ? '#b58863' : '#f0d9b5' }}>
                    {8 - rank}
                  </span>
                )}
                {rank === (orientation === 'w' ? 7 : 0) && (
                  <span style={{ position: 'absolute', bottom: '2px', right: '2px', fontSize: '10px', color: isLightSquare(file, rank) ? '#b58863' : '#f0d9b5' }}>
                    {String.fromCharCode(97 + file)}
                  </span>
                )}
                {checkmate && piece?.type === 'k' && (
                  <div data-testid="checkmate-indicator" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '40px',
                    opacity: 0.3,
                  }}>
                    💀
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChessBoard;

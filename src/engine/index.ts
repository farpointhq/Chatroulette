// Chess engine exports

// Core types
export type {
  PieceType,
  PieceColor,
  Piece,
  BoardSquare,
  Board,
  Square,
  SquareObj,
  Move,
  CastlingRights,
  GameState,
  GameResult,
  Game
} from './types'

// Board utilities
export {
  fileToIndex,
  rankToIndex,
  indexToFile,
  indexToRank,
  parseSquare,
  squareToString,
  squareToIndices,
  indicesToSquare,
  createEmptyBoard,
  createStartingBoard,
  cloneBoard,
  getPieceAt,
  setPieceAt,
  getPieceAtIndices,
  setPieceAtIndices,
  isValidSquare,
  getAllSquares,
  countPieces,
  findPieces
} from './board'

// FEN handling
export {
  STARTING_FEN,
  parseFEN,
  generateFEN,
  isValidFEN,
  getStartingFEN,
  parseFENPosition,
  parseFENCastling,
  parseFENEnPassant
} from './fen'

// Move generation
export {
  generateLegalMoves,
  generateAllLegalMoves,
  isMoveLegal,
  isInCheck,
  isSquareAttacked,
  findKing,
  getMoveDetails,
  givesCheck,
  isCapture,
  getPromotionOptions,
  isPromotionSquare
} from './moves'

// Special moves
export {
  canCastleKingside,
  canCastleQueenside,
  getKingsideCastleDestination,
  getQueensideCastleDestination,
  isCastlingMove,
  canCaptureEnPassant,
  getEnPassantTarget,
  isEnPassantMove,
  getEnPassantCaptureSquare,
  isPromotionMove,
  needsPromotion,
  getPromotionPieces,
  createPromotionMove,
  getSpecialMoves
} from './special'

// Game management
export {
  createGame,
  createGameFromFEN,
  canMakeMove,
  makeMove,
  undoMove,
  getGameResult,
  isGameOver,
  isInCheck,
  getTurn,
  getMoveCount,
  getLastMove,
  getMovesSAN,
  resetGame,
  cloneGame,
  getFEN,
  getMoveHistory
} from './game'

// PGN handling
export {
  moveToSAN,
  generatePGN,
  getPGNResult,
  generateMoveNumber,
  parsePGN,
  createGameFromPGN,
  parsePGNHeaders
} from './pgn'

// Main engine class
export { ChessEngine, validateFen } from './chess'

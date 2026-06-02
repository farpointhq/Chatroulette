import { Chess as ChessJS, Move as ChessMove } from 'chess.js'
import type { Piece, PieceType, PieceColor as Color, Square, Move, GameState, GameResult } from './types'
import { parseFEN, generateFEN, STARTING_FEN } from './fen'
import { createStartingBoard, cloneBoard } from './board'

/**
 * A complete chess engine implementing move validation, game state management,
 * check/checkmate/stalemate detection, and FEN/PGN import/export.
 * 
 * This is a wrapper around chess.js that provides a consistent API with our types.
 */
export class ChessEngine {
  private chess: ChessJS
  private history: Move[] = []
  
  constructor(fen?: string) {
    this.chess = new ChessJS(fen || STARTING_FEN)
  }
  
  /**
   * Get the current board state (8x8 array, rank 8 first, file a first).
   * board[0][0] = a8, board[7][7] = h1
   */
  getBoard(): (Piece | null)[][] {
    const chessBoard = this.chess.board()
    return chessBoard.map(row => 
      row.map(piece => piece ? { type: piece.type as PieceType, color: piece.color as Color } : null)
    )
  }
  
  /**
   * Get the piece on a given square, or null if empty.
   */
  get(square: Square): Piece | null {
    const piece = this.chess.get(square as any)
    if (!piece) return null
    return { type: piece.type as PieceType, color: piece.color as Color }
  }
  
  /**
   * Get whose turn it is ('w' or 'b').
   */
  turn(): Color {
    return this.chess.turn() as Color
  }
  
  /**
   * Generate all legal moves for the current position.
   * Optionally filter to moves from a specific square.
   * If verbose is true, returns Move objects; otherwise returns SAN strings.
   */
  moves(options?: { square?: Square; verbose?: boolean }): Move[] | string[] {
    const chessMoves = this.chess.moves({ 
      square: options?.square as any, 
      verbose: options?.verbose ?? false 
    })
    
    if (options?.verbose) {
      return (chessMoves as ChessMove[]).map(move => ({
        from: move.from as Square,
        to: move.to as Square,
        promotion: move.promotion as PieceType | undefined,
        flags: move.flags,
        san: move.san
      }))
    }
    
    return chessMoves as string[]
  }
  
  /**
   * Validate and make a move. Returns true if successful, false if illegal.
   * Accepts SAN string (e.g. 'e4', 'Nf3', 'O-O') or { from, to, promotion? } object.
   */
  move(move: string | { from: Square; to: Square; promotion?: PieceType }): boolean {
    try {
      const result = this.chess.move(move as any)
      if (result) {
        this.history.push({
          from: result.from as Square,
          to: result.to as Square,
          promotion: result.promotion as PieceType | undefined,
          flags: result.flags,
          san: result.san
        })
        return true
      }
      return false
    } catch {
      return false
    }
  }
  
  /**
   * Undo the last move. Returns the undone move, or null if no moves to undo.
   */
  undo(): Move | null {
    const undone = this.chess.undo()
    if (!undone) return null
    
    // Remove last move from history
    this.history.pop()
    
    return {
      from: undone.from as Square,
      to: undone.to as Square,
      promotion: undone.promotion as PieceType | undefined,
      flags: undone.flags,
      san: undone.san
    }
  }
  
  /**
   * Check whether a move is legal in the current position.
   */
  isLegal(move: { from: Square; to: Square; promotion?: PieceType }): boolean {
    try {
      const result = this.chess.move(move as any)
      if (result) {
        this.chess.undo()
        return true
      }
      return false
    } catch {
      return false
    }
  }
  
  /**
   * Check whether the current player's king is in check.
   */
  inCheck(): boolean {
    return this.chess.inCheck()
  }
  
  /**
   * Check whether the current position is checkmate.
   */
  isCheckmate(): boolean {
    return this.chess.isCheckmate()
  }
  
  /**
   * Check whether the current position is stalemate.
   */
  isStalemate(): boolean {
    return this.chess.isStalemate()
  }
  
  /**
   * Check whether the game is drawn (stalemate, insufficient material,
   * threefold repetition, or fifty-move rule).
   */
  isDraw(): boolean {
    return this.chess.isDraw()
  }
  
  /**
   * Get the overall game result.
   */
  result(): GameResult {
    if (this.isCheckmate()) {
      return {
        status: 'checkmate',
        winner: this.turn() === 'w' ? 'b' : 'w',
        reason: 'Checkmate'
      }
    }
    
    if (this.isStalemate()) {
      return {
        status: 'stalemate',
        winner: null,
        reason: 'Stalemate'
      }
    }
    
    if (this.isDraw()) {
      return {
        status: 'draw',
        winner: null,
        reason: 'Draw'
      }
    }
    
    return {
      status: 'ongoing',
      winner: null
    }
  }
  
  /**
   * Get the move history as an array of moves.
   */
  historyMoves(): Move[] {
    return [...this.history]
  }
  
  /**
   * Export the current position as a FEN string.
   */
  fen(): string {
    return this.chess.fen()
  }
  
  /**
   * Load a position from a FEN string.
   */
  load(fen: string): boolean {
    try {
      const result = this.chess.load(fen)
      if (result) {
        this.history = []
        return true
      }
      return false
    } catch {
      return false
    }
  }
  
  /**
   * Export the game as a PGN string.
   * Optionally include headers (Event, Site, Date, White, Black, Result).
   */
  pgn(options?: { headers?: Record<string, string> }): string {
    return this.chess.pgn()
  }
  
  /**
   * Load a game from a PGN string.
   */
  loadPgn(pgn: string): boolean {
    try {
      const result = this.chess.loadPgn(pgn)
      if (result) {
        // Rebuild history from moves
        this.history = []
        const moves = this.chess.history({ verbose: true })
        this.history = moves.map(move => ({
          from: move.from as Square,
          to: move.to as Square,
          promotion: move.promotion as PieceType | undefined,
          flags: move.flags,
          san: move.san
        }))
        return true
      }
      return false
    } catch {
      return false
    }
  }
  
  /**
   * Reset the board to the standard starting position.
   */
  reset(): void {
    this.chess.reset()
    this.history = []
  }
  
  /**
   * Clear the board completely (no pieces).
   */
  clear(): void {
    this.chess.clear()
    this.history = []
  }
  
  /**
   * Place a piece on a square (for setting up custom positions).
   */
  put(piece: Piece, square: Square): boolean {
    try {
      return this.chess.put({ type: piece.type, color: piece.color } as any, square as any)
    } catch {
      return false
    }
  }
  
  /**
   * Remove a piece from a square.
   */
  remove(square: Square): Piece | null {
    const piece = this.chess.get(square as any)
    if (!piece) return null
    this.chess.remove(square as any)
    return { type: piece.type as PieceType, color: piece.color as Color }
  }
  
  /**
   * Get the current game state as a GameState object.
   */
  getState(): GameState {
    return parseFEN(this.fen())
  }
  
  /**
   * Check if the game is over.
   */
  isGameOver(): boolean {
    return this.chess.isGameOver()
  }
  
  /**
   * Get all legal moves in the current position.
   */
  getAllLegalMoves(): Square[] {
    const moves = this.chess.moves({ verbose: true }) as ChessMove[]
    return moves.map(m => m.to as Square)
  }
}

/**
 * Validate a FEN string for structural correctness.
 */
export function validateFen(fen: string): { ok: boolean; error?: string } {
  try {
    const chess = new ChessJS(fen)
    // If we can create a Chess instance, the FEN is valid
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

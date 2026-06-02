// Game state management - create games, make moves, track history

import { Chess, Move as ChessMove } from 'chess.js'
import type { GameState, Game, Move, GameResult, PieceColor, Square, Board } from './types'
import { parseFEN, generateFEN, STARTING_FEN } from './fen'
import { createStartingBoard, cloneBoard } from './board'

/** Create a new game in starting position */
export function createGame(): Game {
  const initialState = parseFEN(STARTING_FEN)
  
  return {
    state: initialState,
    moveHistory: [],
    result: {
      status: 'ongoing',
      winner: null
    },
    fenHistory: [STARTING_FEN]
  }
}

/** Create a game from a FEN string */
export function createGameFromFEN(fen: string): Game {
  const state = parseFEN(fen)
  
  return {
    state,
    moveHistory: [],
    result: {
      status: 'ongoing',
      winner: null
    },
    fenHistory: [fen]
  }
}

/** Check if a move can be made */
export function canMakeMove(game: Game, from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n'): boolean {
  const chess = new Chess(generateFEN(game.state))
  
  try {
    const move = chess.move({ from, to, promotion })
    if (move) {
      chess.undo()
      return true
    }
    return false
  } catch {
    return false
  }
}

/** Make a move and return the new game state */
export function makeMove(game: Game, from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n'): Game | null {
  const chess = new Chess(generateFEN(game.state))
  
  try {
    const move = chess.move({ from, to, promotion, verbose: true })
    if (!move) return null
    
    // Create new game state
    const newState = parseFEN(chess.fen())
    
    // Create move record
    const moveRecord: Move = {
      from,
      to,
      promotion: move.promotion as any,
      flags: move.flags,
      san: move.san
    }
    
    // Check game result
    const result = getGameResult(newState)
    
    return {
      state: newState,
      moveHistory: [...game.moveHistory, moveRecord],
      result,
      fenHistory: [...game.fenHistory, chess.fen()]
    }
  } catch {
    return null
  }
}

/** Undo the last move and return the previous game state */
export function undoMove(game: Game): Game | null {
  if (game.moveHistory.length === 0) return null
  
  // Get the previous FEN
  const previousFEN = game.fenHistory[game.fenHistory.length - 2]
  const previousState = parseFEN(previousFEN)
  
  // Remove last move from history
  const newMoveHistory = game.moveHistory.slice(0, -1)
  const newFenHistory = game.fenHistory.slice(0, -1)
  
  return {
    state: previousState,
    moveHistory: newMoveHistory,
    result: {
      status: 'ongoing',
      winner: null
    },
    fenHistory: newFenHistory
  }
}

/** Get the current game result */
export function getGameResult(state: GameState): GameResult {
  const chess = new Chess(generateFEN(state))
  
  if (chess.isCheckmate()) {
    return {
      status: 'checkmate',
      winner: state.turn === 'w' ? 'b' : 'w',
      reason: 'Checkmate'
    }
  }
  
  if (chess.isStalemate()) {
    return {
      status: 'stalemate',
      winner: null,
      reason: 'Stalemate'
    }
  }
  
  if (chess.isDraw()) {
    return {
      status: 'draw',
      winner: null,
      reason: 'Draw'
    }
  }
  
  if (chess.isInsufficientMaterial()) {
    return {
      status: 'insufficient',
      winner: null,
      reason: 'Insufficient material'
    }
  }
  
  if (chess.isThreefoldRepetition()) {
    return {
      status: 'threefold',
      winner: null,
      reason: 'Threefold repetition'
    }
  }
  
  // Check 50-move rule
  if (state.halfmoveClock >= 100) {
    return {
      status: 'fifty',
      winner: null,
      reason: 'Fifty-move rule'
    }
  }
  
  return {
    status: 'ongoing',
    winner: null
  }
}

/** Check if the game is over */
export function isGameOver(game: Game): boolean {
  return game.result.status !== 'ongoing'
}

/** Check if a player is in check */
export function isInCheck(game: Game): boolean {
  const chess = new Chess(generateFEN(game.state))
  return chess.inCheck()
}

/** Get whose turn it is */
export function getTurn(game: Game): PieceColor {
  return game.state.turn
}

/** Get the number of moves made */
export function getMoveCount(game: Game): number {
  return game.moveHistory.length
}

/** Get the last move made */
export function getLastMove(game: Game): Move | undefined {
  return game.moveHistory[game.moveHistory.length - 1]
}

/** Get all moves in SAN notation */
export function getMovesSAN(game: Game): string[] {
  return game.moveHistory.map(move => move.san || '')
}

/** Reset the game to starting position */
export function resetGame(): Game {
  return createGame()
}

/** Clone a game state */
export function cloneGame(game: Game): Game {
  return {
    state: {
      board: cloneBoard(game.state.board),
      turn: game.state.turn,
      castling: { ...game.state.castling },
      enPassant: game.state.enPassant,
      halfmoveClock: game.state.halfmoveClock,
      fullmoveNumber: game.state.fullmoveNumber
    },
    moveHistory: game.moveHistory.map(m => ({ ...m })),
    result: { ...game.result },
    fenHistory: [...game.fenHistory]
  }
}

/** Get the current FEN string */
export function getFEN(game: Game): string {
  return generateFEN(game.state)
}

/** Get the move history */
export function getMoveHistory(game: Game): Move[] {
  return game.moveHistory
}

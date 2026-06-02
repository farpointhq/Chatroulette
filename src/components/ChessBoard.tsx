import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type { GameState, Move, PieceColor, PieceType, Square } from '../types/chess'

export interface ChessBoardProps {
  /** The current game state to render */
  gameState: GameState
  /** Called when a player makes a valid move */
  onMove: (move: Move) => void
  /** Which color the board is oriented for (white = white at bottom) */
  orientation?: PieceColor
  /** Optional className for styling */
  className?: string
  /** Whether the board is interactive (false for spectator view) */
  interactive?: boolean
  /** Currently selected square for move input */
  selectedSquare?: Square | null
  /** Legal moves to highlight */
  legalMoves?: Square[]
}

const PIECE_SYMBOLS: Record<string, string> = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

function squareName(row: number, col: number): string {
  return `${FILES[col]}${8 - row}`
}

function parseSquare(name: string): { row: number; col: number } {
  return {
    row: 8 - parseInt(name[1], 10),
    col: FILES.indexOf(name[0]),
  }
}

function gameStateToFEN(gs: GameState): string {
  const rows: string[] = []
  for (let r = 0; r < 8; r++) {
    let rowStr = ''
    let emptyCount = 0
    for (let c = 0; c < 8; c++) {
      const piece = gs.board[r][c]
      if (piece) {
        if (emptyCount > 0) {
          rowStr += emptyCount
          emptyCount = 0
        }
        const ch = piece.type
        rowStr += piece.color === 'w' ? ch.toUpperCase() : ch.toLowerCase()
      } else {
        emptyCount++
      }
    }
    if (emptyCount > 0) rowStr += emptyCount
    rows.push(rowStr)
  }

  const placement = rows.join('/')
  const activeColor = gs.activeColor
  const castling = [
    gs.castlingRights.w.kingSide ? 'K' : '',
    gs.castlingRights.w.queenSide ? 'Q' : '',
    gs.castlingRights.b.kingSide ? 'k' : '',
    gs.castlingRights.b.queenSide ? 'q' : '',
  ].join('') || '-'

  const ep = gs.enPassantTarget
    ? `${FILES[gs.enPassantTarget.col]}${8 - gs.enPassantTarget.row}`
    : '-'

  return `${placement} ${activeColor} ${castling} ${ep} ${gs.halfmoveClock} ${gs.fullmoveNumber}`
}

// Module-level drag source for jsdom DnD
let dragSource: string | null = null

/**
 * Interactive chess board component.
 *
 * Renders an 8×8 board with click-to-move, legal-move highlights,
 * last-move highlight, check indicators, and piece rendering.
 */
export const ChessBoard: React.FC<ChessBoardProps> = ({
  gameState,
  onMove,
  orientation = 'w',
  className,
  interactive = true,
  selectedSquare,
  legalMoves,
}) => {
<<<<<<< HEAD
  const isWhiteOriented = orientation === 'w'

  // DOM order of ranks and files based on orientation
  const rankOrder = isWhiteOriented
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [8, 7, 6, 5, 4, 3, 2, 1]

  const fileOrder = isWhiteOriented
    ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']

  return (
    <div
      data-testid="chess-board"
      className={className}
      style={{
        display: 'inline-block',
        position: 'relative',
        maxWidth: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
        {rankOrder.map((rank) => (
          <div key={rank} style={{ display: 'flex' }}>
            {fileOrder.map((file) => {
              const square = `${file}${rank}`
              const { row, col } = parseSquare(square)
              const piece = gameState.board[row][col]
              const isLight = (row + col) % 2 === 0

              return (
                <div
                  key={square}
                  data-testid={`square-${square}`}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: isLight ? '#F0D9B5' : '#B58863',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: interactive ? 'pointer' : 'default',
                    fontSize: 28,
                    userSelect: 'none',
                  }}
                >
                  {piece && PIECE_SYMBOLS[`${piece.color}${piece.type}`]}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* File coordinate notation */}
      <div style={{ display: 'flex', marginTop: 2 }}>
        {fileOrder.map((file) => (
          <div
            key={file}
            data-testid={`coord-file-${file}`}
            style={{ width: 40, textAlign: 'center', fontSize: 10 }}
          >
            {file}
          </div>
        ))}
      </div>

      {/* Rank coordinate notation */}
      <div style={{ position: 'absolute', left: -16, top: 0, display: 'flex', flexDirection: 'column-reverse' }}>
        {rankOrder.map((rank) => (
          <div
            key={rank}
            data-testid={`coord-rank-${rank}`}
            style={{ height: 40, display: 'flex', alignItems: 'center', fontSize: 10 }}
          >
            {rank}
          </div>
        ))}
      </div>
    </div>
  )
    </div>
  )
}

// Helper to get piece at square (exported for tests)
export function getPieceAtSquare(board: GameState['board'], square: Square): Piece | null {
  const file = square[0]
  const rank = parseInt(square[1], 10)
  const fileIdx = file.charCodeAt(0) - 'a'.charCodeAt(0)
  const rankIdx = 8 - rank
  return board[rankIdx][fileIdx]
}

// Helper to create square notation from indices
export function indicesToSquare(rankIdx: number, fileIdx: number): Square {
  const file = String.fromCharCode('a'.charCodeAt(0) + fileIdx)
  const rank = 8 - rankIdx
  return `${file}${rank}` as Square
}

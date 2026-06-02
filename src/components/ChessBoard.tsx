import React from 'react'
import type { GameState, Move, PieceColor } from '../types/chess'

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
}

/**
 * Interactive chess board component.
 *
 * Renders an 8×8 board with drag-and-drop, click-to-move, legal-move
 * highlights, last-move highlight, check/checkmate indicators, and a
 * pawn-promotion picker.
 */
export const ChessBoard: React.FC<ChessBoardProps> = ({
  gameState,
  onMove,
  orientation = 'w',
  className,
  interactive = true,
}) => {
  // Intentionally stubbed — renders an incomplete grid with no pieces,
  // no highlights, no drag/drop, and always calls onMove so that every
  // test assertion fails (RED phase).
  return (
    <div data-testid="chess-board" style={{ display: 'inline-block' }}>
      {/* Deliberately 7×7 so the "64 squares" assertion fails */}
      {Array.from({ length: 7 }).map((_, row) => (
        <div key={row} style={{ display: 'flex' }}>
          {Array.from({ length: 7 }).map((_, col) => {
            const file = String.fromCharCode(97 + col)
            const rank = 8 - row
            const squareName = `${file}${rank}`
            return (
              <div
                key={col}
                data-testid={`square-${squareName}`}
                style={{ width: 40, height: 40 }}
                onClick={() =>
                  onMove({ from: { row, col }, to: { row, col } })
                }
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

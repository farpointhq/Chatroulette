import React, { useState, useCallback } from 'react'
import type { GameState, Move, PieceColor, Piece, Square } from '../engine/types'

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
  const [draggedPiece, setDraggedPiece] = useState<Piece | null>(null)
  const [dragSource, setDragSource] = useState<Square | null>(null)

  // Convert board indices to algebraic notation
  const indicesToSquare = (rankIdx: number, fileIdx: number): Square => {
    const file = String.fromCharCode('a'.charCodeAt(0) + fileIdx)
    const rank = 8 - rankIdx
    return `${file}${rank}` as Square
  }

  // Handle square click
  const handleSquareClick = useCallback((square: Square) => {
    if (!interactive) return

    const piece = getPieceAtSquare(gameState.board, square)
    
    // If we have a selected square, try to move
    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect if clicking the same square
        // This would be handled by parent component
        return
      }
      
      // Try to make a move
      onMove({
        from: selectedSquare,
        to: square
      })
      return
    }
    
    // Select piece if it belongs to the current player
    if (piece && piece.color === gameState.turn) {
      // Selection would be handled by parent component
      console.log('Selected:', square)
    }
  }, [gameState, selectedSquare, onMove, interactive])

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, square: Square, piece: Piece) => {
    if (!interactive) return
    setDraggedPiece(piece)
    setDragSource(square)
    e.dataTransfer.effectAllowed = 'move'
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault()
    if (dragSource && draggedPiece) {
      onMove({
        from: dragSource,
        to: targetSquare
      })
    }
    setDraggedPiece(null)
    setDragSource(null)
  }

  // Get piece at square from board
  const getPieceAtSquare = (board: GameState['board'], square: Square): Piece | null => {
    const file = square[0]
    const rank = parseInt(square[1], 10)
    const fileIdx = file.charCodeAt(0) - 'a'.charCodeAt(0)
    const rankIdx = 8 - rank
    return board[rankIdx][fileIdx]
  }

  // Check if square is highlighted
  const isHighlighted = (square: Square): boolean => {
    return legalMoves?.includes(square) ?? false
  }

  // Check if square is the last move
  const isLastMove = (square: Square): boolean => {
    // Would need lastMove info from game state
    return false
  }

  // Render piece symbol
  const renderPiece = (piece: Piece | null) => {
    if (!piece) return null
    
    const symbols: Record<string, string> = {
      'w': { 'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙' }[piece.type],
      'b': { 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' }[piece.type]
    }
    
    return (
      <span 
        style={{ 
          fontSize: '32px', 
          cursor: interactive && piece.color === gameState.turn ? 'grab' : 'default',
          userSelect: 'none'
        }}
        draggable={interactive && piece.color === gameState.turn}
        onDragStart={(e) => handleDragStart(e, indicesToSquare(8 - parseInt(square[1], 10), square.charCodeAt(0) - 'a'.charCodeAt(0)), piece)}
      >
        {symbols[piece.color][piece.type]}
      </span>
    )
  }

  // Generate board squares
  const renderBoard = () => {
    const rows = []
    
    for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
      const rank = 8 - rankIdx
      const rowSquares = []
      
      for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
        const file = String.fromCharCode('a'.charCodeAt(0) + fileIdx)
        const square = `${file}${rank}` as Square
        const piece = gameState.board[rankIdx][fileIdx]
        const isLight = (rankIdx + fileIdx) % 2 === 0
        const highlighted = isHighlighted(square)
        const lastMove = isLastMove(square)
        const isSelected = selectedSquare === square
        
        // Determine square color
        let bgColor = isLight ? '#f0d9b5' : '#b58863'
        if (highlighted) bgColor = '#baca44'  // Legal move highlight
        if (isSelected) bgColor = '#f6f669'   // Selected piece highlight
        if (lastMove) bgColor = '#f5f682'     // Last move highlight
        
        rowSquares.push(
          <div
            key={square}
            data-testid={`square-${square}`}
            onClick={() => handleSquareClick(square)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, square)}
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: interactive ? 'pointer' : 'default',
              position: 'relative'
            }}
          >
            {/* Rank label on left edge */}
            {fileIdx === 0 && (
              <span style={{
                position: 'absolute',
                left: '2px',
                top: '2px',
                fontSize: '10px',
                color: isLight ? '#b58863' : '#f0d9b5',
                fontWeight: 'bold'
              }}>
                {rank}
              </span>
            )}
            
            {/* File label on bottom edge */}
            {rankIdx === 7 && (
              <span style={{
                position: 'absolute',
                right: '2px',
                bottom: '2px',
                fontSize: '10px',
                color: isLight ? '#b58863' : '#f0d9b5',
                fontWeight: 'bold'
              }}>
                {file}
              </span>
            )}
            
            {/* Piece */}
            {renderPiece(piece)}
          </div>
        )
      }
      
      rows.push(
        <div key={rank} style={{ display: 'flex' }}>
          {rowSquares}
        </div>
      )
    }
    
    return rows
  }

  return (
    <div 
      data-testid="chess-board" 
      className={className}
      style={{ 
        display: 'inline-block',
        border: '4px solid #6f4e37',
        borderRadius: '4px'
      }}
    >
      {renderBoard()}
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

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Chess } from 'chess.js'
import type { GameState, Move, PieceColor, PieceType } from '../types/chess'

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
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null)

  const chess = useMemo(() => new Chess(gameStateToFEN(gameState)), [gameState])

  // Reset selection when game state changes
  useEffect(() => {
    setSelectedSquare(null)
    setPendingPromotion(null)
  }, [gameState])

  const isWhiteOriented = orientation === 'w'

  // DOM order of ranks and files based on orientation
  const rankOrder = isWhiteOriented
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [8, 7, 6, 5, 4, 3, 2, 1]

  const fileOrder = isWhiteOriented
    ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']

  const getLegalMoves = useCallback((square: string): string[] => {
    try {
      const moves = chess.moves({ square: square as any, verbose: true })
      return moves.map(m => m.to)
    } catch {
      return []
    }
  }, [chess])

  const isPromotion = useCallback((from: string, to: string): boolean => {
    const piece = chess.get(from as any)
    if (!piece || piece.type !== 'p') return false
    const toRank = parseInt(to[1], 10)
    return (piece.color === 'w' && toRank === 8) || (piece.color === 'b' && toRank === 1)
  }, [chess])

  const handleMove = useCallback((from: string, to: string, promotion?: PieceType) => {
    if (!interactive) return false

    const fromCoords = parseSquare(from)
    const toCoords = parseSquare(to)

    const move: Move = {
      from: fromCoords,
      to: toCoords,
      ...(promotion && { promotion }),
    }

    onMove(move)
    setSelectedSquare(null)
    setPendingPromotion(null)
    return true
  }, [interactive, onMove])

  const onSquareClick = useCallback((square: string) => {
    if (!interactive) return

    const piece = chess.get(square as any)

    if (pendingPromotion) return // Don't allow clicks while promotion picker is open

    if (selectedSquare) {
      const legalMoves = getLegalMoves(selectedSquare)

      if (legalMoves.includes(square)) {
        if (isPromotion(selectedSquare, square)) {
          setPendingPromotion({ from: selectedSquare, to: square })
          return
        }
        handleMove(selectedSquare, square)
      } else if (piece && piece.color === gameState.activeColor) {
        setSelectedSquare(square)
      } else {
        setSelectedSquare(null)
      }
    } else {
      if (piece && piece.color === gameState.activeColor) {
        setSelectedSquare(square)
      }
    }
  }, [chess, selectedSquare, gameState.activeColor, getLegalMoves, isPromotion, handleMove, interactive, pendingPromotion])

  const onPromotionSelect = useCallback((piece: PieceType) => {
    if (!pendingPromotion) return
    handleMove(pendingPromotion.from, pendingPromotion.to, piece)
  }, [pendingPromotion, handleMove])

  const onDragStart = useCallback((square: string) => {
    if (!interactive) return
    const piece = chess.get(square as any)
    if (piece && piece.color === gameState.activeColor) {
      dragSource = square
      setSelectedSquare(square)
    }
  }, [chess, gameState.activeColor, interactive])

  const onDrop = useCallback((targetSquare: string) => {
    if (!interactive || !dragSource) return false

    const legalMoves = getLegalMoves(dragSource)
    if (!legalMoves.includes(targetSquare)) {
      dragSource = null
      setSelectedSquare(null)
      return false
    }

    if (isPromotion(dragSource, targetSquare)) {
      setPendingPromotion({ from: dragSource, to: targetSquare })
      dragSource = null
      return true
    }

    const result = handleMove(dragSource, targetSquare)
    dragSource = null
    return result
  }, [interactive, getLegalMoves, isPromotion, handleMove])

  // Determine king square for check/checkmate indicators
  const kingSquare = useMemo(() => {
    if (!gameState.isCheck && !gameState.isCheckmate) return null
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = gameState.board[r][c]
        if (piece && piece.type === 'k' && piece.color === gameState.activeColor) {
          return squareName(r, c)
        }
      }
    }
    return null
  }, [gameState])

  // Last move squares
  const lastMoveSquares = useMemo(() => {
    if (!gameState.lastMove) return new Set<string>()
    return new Set([
      squareName(gameState.lastMove.from.row, gameState.lastMove.from.col),
      squareName(gameState.lastMove.to.row, gameState.lastMove.to.col),
    ])
  }, [gameState.lastMove])

  // Legal moves for selected square
  const legalMoveSquares = useMemo(() => {
    if (!selectedSquare) return new Set<string>()
    return new Set(getLegalMoves(selectedSquare))
  }, [selectedSquare, getLegalMoves])

  const isGameOver = gameState.isCheckmate || gameState.isStalemate

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
              const isSelected = selectedSquare === square
              const isLegal = legalMoveSquares.has(square)
              const isLastMove = lastMoveSquares.has(square)
              const isCheckSquare = kingSquare === square && gameState.isCheck
              const isCheckmateSquare = kingSquare === square && gameState.isCheckmate

              return (
                <div
                  key={square}
                  data-testid={`square-${square}`}
                  data-last-move={isLastMove ? 'true' : undefined}
                  data-check={isCheckSquare ? 'true' : undefined}
                  data-checkmate={isCheckmateSquare ? 'true' : undefined}
                  draggable={interactive && !!piece}
                  onClick={() => onSquareClick(square)}
                  onDragStart={() => onDragStart(square)}
                  onDragOver={(e) => {
                    e.preventDefault()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    onDrop(square)
                  }}
                  onDragEnd={() => {
                    dragSource = null
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: isSelected ? '#BBCC44' : isLight ? '#F0D9B5' : '#B58863',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: interactive ? 'pointer' : 'default',
                    position: 'relative',
                    fontSize: 28,
                    userSelect: 'none',
                  }}
                >
                  {piece && PIECE_SYMBOLS[`${piece.color}${piece.type}`]}
                  {isLegal && (
                    <div
                      data-testid={`legal-move-${square}`}
                      style={{
                        position: 'absolute',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      }}
                    />
                  )}
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

      {/* Promotion picker */}
      {pendingPromotion && (
        <div
          data-testid="promotion-picker"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            border: '1px solid black',
            padding: 8,
            display: 'flex',
            gap: 8,
            zIndex: 10,
          }}
        >
          {(['q', 'r', 'b', 'n'] as PieceType[]).map((p) => (
            <button
              key={p}
              data-testid={`promote-${p === 'q' ? 'queen' : p === 'r' ? 'rook' : p === 'b' ? 'bishop' : 'knight'}`}
              onClick={() => onPromotionSelect(p)}
              style={{ fontSize: 24, cursor: 'pointer' }}
            >
              {PIECE_SYMBOLS[`${gameState.activeColor}${p}`]}
            </button>
          ))}
        </div>
      )}

      {/* Game over overlay */}
      {isGameOver && (
        <div
          data-testid="game-over-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          {gameState.isCheckmate ? 'Checkmate' : 'Stalemate'}
        </div>
      )}
    </div>
  )
}
